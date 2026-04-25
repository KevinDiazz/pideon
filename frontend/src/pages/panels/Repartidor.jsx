import { useEffect, useMemo, useState } from "react";
import {
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bike, Package, CheckCircle2, Download } from "lucide-react";
import { ordersService } from "../../services/ordersService";
import { useAuthStore } from "../../store/authStore";
import { useRepartidorStore } from "../../store/repartidorStore";
import OrderCard from "../../components/OrderCard";
import {
  pedidoQueryOptions,
  useAsignarRepartidor,
  useUpdateEstado,
} from "../../hooks/usePedidoMutations";

const TABS = [
  { key: "disponibles", label: "Disponibles", Icon: Package },
  { key: "mios", label: "Mis repartos", Icon: Bike },
  { key: "entregados", label: "Entregados", Icon: CheckCircle2 },
];

const TAB_STORAGE_KEY = "pideon.repartidor.activeTab";

const Repartidor = () => {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // Recordamos la pestaña activa entre navegaciones (logo → redirect → volver aquí).
  const [tab, setTab] = useState(() => {
    try {
      const saved = sessionStorage.getItem(TAB_STORAGE_KEY);
      return saved && TABS.some((t) => t.key === saved) ? saved : "disponibles";
    } catch {
      return "disponibles";
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(TAB_STORAGE_KEY, tab);
    } catch {
      // ignore
    }
  }, [tab]);

  // Store de repartidor (ids de los pedidos que tengo asignados en curso).
  const initStore = useRepartidorStore((s) => s.init);
  const ids = useRepartidorStore((s) => s.ids);
  const addId = useRepartidorStore((s) => s.addId);
  const removeId = useRepartidorStore((s) => s.removeId);
  const storeUserId = useRepartidorStore((s) => s.userId);

  // Inicialización: si el store todavía no se ha hidratado para este usuario
  // (recarga de página o primer login), cargamos sus ids desde localStorage
  // ANTES del primer render efectivo, así "Mis repartos" no parpadea a 0.
  useEffect(() => {
    if (user?.id && storeUserId !== user.id) {
      initStore(user.id);
    }
  }, [user?.id, storeUserId, initStore]);

  // 1) Pedidos LISTOS disponibles (sin asignación todavía).
  const { data: listosRaw = [], isLoading, isError } = useQuery({
    queryKey: ["pedidos", "listos"],
    queryFn: ordersService.listos,
    ...pedidoQueryOptions,
  });
  const listos = Array.isArray(listosRaw) ? listosRaw : [];

  // 2) Pedidos que YO tengo (ya en estado "reparto"). Se traen uno a uno
  //    por id; así seguimos su estado hasta que estén entregados.
  const misQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["pedidos", "byId", id],
      queryFn: () => ordersService.getById(id),
      ...pedidoQueryOptions,
      retry: 1,
    })),
  });

  const trackedSignature = misQueries
    .map((q) => {
      const errStatus = q.error?.response?.status || "";
      return `${q.data?.estado || ""}:${q.isError ? "err" + errStatus : "ok"}`;
    })
    .join("|");

  useEffect(() => {
    misQueries.forEach((q, idx) => {
      const id = ids[idx];
      if (id == null) return;
      const status = q.error?.response?.status;
      if (q.isError && status === 404) {
        removeId(id);
      } else if (q.data && q.data.estado === "entregado") {
        removeId(id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackedSignature]);

  // 3) Histórico completo del repartidor (para la pestaña "Entregados").
  //    Lo dejamos SIEMPRE activo para que el contador del tab sea correcto
  //    incluso sin haber visitado la pestaña todavía. Intervalo largo para
  //    no saturar: el pedido recién entregado ya aparece por invalidate.
  const {
    data: misRepartosRaw = [],
    isLoading: loadingHistorico,
    isError: errorHistorico,
    error: errHistorico,
    refetch: refetchHistorico,
  } = useQuery({
    queryKey: ["pedidos", "misRepartos", user?.id],
    queryFn: ordersService.misRepartos,
    enabled: !!user?.id,
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    // Mantener el array previo mientras refetchea, para que el contador no
    // parpadee a 0 al remontar el componente (click en logo → redirect).
    placeholderData: (prev) => prev,
  });

  // --- Disponibles ---
  const sinAsignar = useMemo(
    () =>
      listos
        .filter(
          (p) => p.tipo_entrega === "domicilio" && !p.asignacion_reparto?.length
        )
        .sort(
          (a, b) =>
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        ),
    [listos]
  );

  // --- Mis repartos (en curso) ---
  const mios = useMemo(() => {
    const tracked = misQueries
      .map((q) => q.data)
      .filter((p) => p && p.estado !== "entregado");
    const byId = new Map();
    tracked.forEach((p) => {
      if (p && !byId.has(p.id)) byId.set(p.id, p);
    });
    return Array.from(byId.values()).sort(
      (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackedSignature]);

  // --- Entregados (histórico) ---
  const entregados = useMemo(() => {
    const list = Array.isArray(misRepartosRaw) ? misRepartosRaw : [];
    return list
      .filter((p) => p.estado === "entregado")
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
  }, [misRepartosRaw]);

  const asignar = useAsignarRepartidor(user?.id);
  const updateEstado = useUpdateEstado();

  const handleAsignar = (id) => {
    addId(id);

    const original = listos.find((p) => p.id === id);
    if (original) {
      qc.setQueryData(["pedidos", "byId", id], {
        ...original,
        estado: "reparto",
        updated_at: new Date().toISOString(),
        asignacion_reparto: [
          ...(original.asignacion_reparto || []),
          { repartidor_id: user?.id, pedido_id: id, _optimistic: true },
        ],
      });
    }

    asignar.mutate(id, {
      onError: () => {
        qc.removeQueries({ queryKey: ["pedidos", "byId", id] });
        removeId(id);
      },
      onSuccess: () => {
        // Al asignarme cambio a la pestaña "Mis repartos".
        setTab("mios");
      },
    });
  };

  const handleEntregar = (id) => {
    updateEstado.mutate(
      { id, estado: "entregado" },
      {
        onSuccess: () => {
          removeId(id);
          // Refresco el histórico para que el pedido aparezca en "Entregados".
          qc.invalidateQueries({
            queryKey: ["pedidos", "misRepartos", user?.id],
          });
        },
      }
    );
  };

  // Estado para controlar la descarga de factura (UI + errores).
  const [descargandoId, setDescargandoId] = useState(null);
  const [errorDescarga, setErrorDescarga] = useState(null);

  const handleDescargarFactura = async (id) => {
    setErrorDescarga(null);
    setDescargandoId(id);
    try {
      await ordersService.descargarFacturaYGuardar(id);
    } catch (err) {
      setErrorDescarga(
        err?.response?.data?.message ||
          err?.message ||
          "No se pudo descargar la factura."
      );
    } finally {
      setDescargandoId(null);
    }
  };

  const btn = (label, color, onClick, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${color} text-white text-sm font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60`}
    >
      {label}
    </button>
  );

  // Contadores para las pestañas
  const counts = {
    disponibles: sinAsignar.length,
    mios: mios.length,
    entregados: entregados.length,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bike className="text-emerald-600" size={28} />
        <h2 className="text-2xl md:text-3xl font-black text-amber-900">
          Panel de repartidor
        </h2>
      </div>

      {(asignar.isError || updateEstado.isError || isError) && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-4">
          {asignar.error?.response?.data?.message ||
            updateEstado.error?.response?.data?.message ||
            "Error al actualizar"}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-orange-100">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 font-semibold -mb-px border-b-2 transition text-sm sm:text-base ${
              tab === t.key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-amber-900/70 hover:text-emerald-600"
            }`}
          >
            <t.Icon size={16} />
            <span>{t.label}</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                tab === t.key
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-orange-50 text-amber-900/70"
              }`}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Pestaña: Disponibles */}
      {tab === "disponibles" && (
        <section>
          {isLoading ? (
            <p className="text-amber-900/70">Cargando...</p>
          ) : sinAsignar.length === 0 ? (
            <p className="text-amber-900/60 italic">
              No hay pedidos listos sin asignar.
            </p>
          ) : (
            <div className="space-y-3 lg:w-1/2 w-full">
              {sinAsignar.map((p) => (
                <OrderCard
                  key={p.id}
                  pedido={p}
                  actions={btn(
                    asignar.isPending ? "Asignando..." : "Asignarme",
                    "bg-emerald-600 hover:bg-emerald-700",
                    () => handleAsignar(p.id),
                    asignar.isPending
                  )}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pestaña: Mis repartos */}
      {tab === "mios" && (
        <section>
          {mios.length === 0 ? (
            <p className="text-amber-900/60 italic">
              No tienes pedidos asignados.
            </p>
          ) : (
            <div className="space-y-3 lg:w-1/2 w-full">
              {mios.map((p) => (
                <OrderCard
                  key={p.id}
                  pedido={p}
                  actions={btn(
                    updateEstado.isPending
                      ? "Entregando..."
                      : "Marcar entregado",
                    "bg-emerald-600 hover:bg-emerald-700",
                    () => handleEntregar(p.id),
                    updateEstado.isPending
                  )}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pestaña: Entregados */}
      {tab === "entregados" && (
        <section>
          {loadingHistorico ? (
            <p className="text-amber-900/70">Cargando histórico...</p>
          ) : errorHistorico ? (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm">
              <p className="font-semibold mb-1">
                No se pudo cargar el histórico.
              </p>
              <p className="text-xs">
                {errHistorico?.response?.data?.message ||
                  errHistorico?.message ||
                  "Error de red"}
                . Si acabas de añadir el endpoint, reinicia el backend.
              </p>
              <button
                onClick={() => refetchHistorico()}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                Reintentar
              </button>
            </div>
          ) : entregados.length === 0 ? (
            <p className="text-amber-900/60 italic">
              Aún no has entregado ningún pedido.
            </p>
          ) : (
            <>
              {errorDescarga && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-3">
                  {errorDescarga}
                </div>
              )}
              <div className="space-y-3 lg:w-1/2 w-full">
                {entregados.map((p) => (
                  <OrderCard
                    key={p.id}
                    pedido={p}
                    actions={
                      <button
                        onClick={() => handleDescargarFactura(p.id)}
                        disabled={descargandoId === p.id}
                        className="bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-sm font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                        title="Descargar factura (PDF)"
                      >
                        <Download size={16} />
                        {descargandoId === p.id
                          ? "Descargando..."
                          : "Descargar factura"}
                      </button>
                    }
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default Repartidor;
