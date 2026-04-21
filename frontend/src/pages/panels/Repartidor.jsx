import { useEffect } from "react";
import {
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bike } from "lucide-react";
import { ordersService } from "../../services/ordersService";
import { useAuthStore } from "../../store/authStore";
import { useRepartidorStore } from "../../store/repartidorStore";
import OrderCard from "../../components/OrderCard";
import {
  pedidoQueryOptions,
  useAsignarRepartidor,
  useUpdateEstado,
} from "../../hooks/usePedidoMutations";

const Repartidor = () => {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // Store de repartidor (ids de los pedidos que tengo asignados)
  const initStore = useRepartidorStore((s) => s.init);
  const ids = useRepartidorStore((s) => s.ids);
  const addId = useRepartidorStore((s) => s.addId);
  const removeId = useRepartidorStore((s) => s.removeId);

  useEffect(() => {
    if (user?.id) initStore(user.id);
  }, [user?.id, initStore]);

  // 1) Pedidos LISTOS disponibles (sin asignación todavía).
  //    Nada más asignarme uno, el backend lo pasa a estado "reparto", así que
  //    desaparece de este endpoint y pasa a rastrearse por id.
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
      // Si falla puntualmente no tiramos el id del store en la primera
      // respuesta; solo lo descartamos si el backend dice 404 de verdad.
      retry: 1,
    })),
  });

  // Limpieza: quita del store ids que ya están entregados o que el backend
  // no reconoce. Usamos una firma estable como dep para no re-disparar en
  // cada render.
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

  // --- Disponibles ---
  // Listos a domicilio sin asignación, ordenados por cuándo se marcaron
  // como "listo" (updated_at ASC → los más antiguos primero).
  const sinAsignar = listos
    .filter(
      (p) => p.tipo_entrega === "domicilio" && !p.asignacion_reparto?.length
    )
    .sort(
      (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    );

  // --- Mis repartos ---
  // Ya están en estado "reparto" (o puntualmente "listo" si se asignó al
  // vuelo). Orden por updated_at ASC: los que llevan más tiempo arriba, los
  // recién asignados al final de la cola.
  const misTracked = misQueries
    .map((q) => q.data)
    .filter((p) => p && p.estado !== "entregado");

  const byId = new Map();
  misTracked.forEach((p) => {
    if (p && !byId.has(p.id)) byId.set(p.id, p);
  });
  const mios = Array.from(byId.values()).sort(
    (a, b) =>
      new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
  );

  const asignar = useAsignarRepartidor(user?.id);
  const updateEstado = useUpdateEstado();

  const handleAsignar = (id) => {
    // Eager: registro el id en el store ANTES de mutar, así la query por id
    // ya arranca y "Mis repartos" se poblará en cuanto responda el backend.
    addId(id);

    // Semilla optimista en la cache de detalle por id: copio el pedido de
    // la lista de "listos" (si está), lo marco como "reparto" con mi
    // asignación y le bumpeo updated_at. Así aparece al instante en
    // "Mis repartos" sin esperar al refetch.
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
        // Si falla la asignación, deshacemos el tracking y limpiamos la
        // semilla optimista.
        qc.removeQueries({ queryKey: ["pedidos", "byId", id] });
        removeId(id);
      },
    });
  };

  const handleEntregar = (id) => {
    updateEstado.mutate(
      { id, estado: "entregado" },
      { onSuccess: () => removeId(id) }
    );
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

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h3 className="text-lg font-bold text-amber-900 mb-3">
            📦 Disponibles para repartir ({sinAsignar.length})
          </h3>
          {isLoading ? (
            <p className="text-amber-900/70">Cargando...</p>
          ) : sinAsignar.length === 0 ? (
            <p className="text-amber-900/60 italic">
              No hay pedidos listos sin asignar.
            </p>
          ) : (
            <div className="space-y-3">
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

        <section>
          <h3 className="text-lg font-bold text-amber-900 mb-3">
            🛵 Mis repartos ({mios.length})
          </h3>
          {mios.length === 0 ? (
            <p className="text-amber-900/60 italic">
              No tienes pedidos asignados.
            </p>
          ) : (
            <div className="space-y-3">
              {mios.map((p) => (
                <OrderCard
                  key={p.id}
                  pedido={p}
                  actions={btn(
                    updateEstado.isPending ? "Entregando..." : "Marcar entregado",
                    "bg-emerald-600 hover:bg-emerald-700",
                    () => handleEntregar(p.id),
                    updateEstado.isPending
                  )}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Repartidor;
