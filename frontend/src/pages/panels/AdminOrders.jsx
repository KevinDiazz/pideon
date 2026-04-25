import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Download } from "lucide-react";
import { ordersService } from "../../services/ordersService";
import OrderCard from "../../components/OrderCard";
import {
  pedidoQueryOptions,
  useUpdateEstado,
} from "../../hooks/usePedidoMutations";

const ESTADOS = [
  "todos",
  "pendiente",
  "preparacion",
  "listo",
  "reparto",
  "entregado",
];

const AdminOrders = () => {
  const [filtro, setFiltro] = useState("todos");

  const { data: pedidos = [], isLoading, isError } = useQuery({
    queryKey: ["pedidos", "all"],
    queryFn: ordersService.all,
    ...pedidoQueryOptions,
    refetchInterval: 20_000,
  });

  const updateEstado = useUpdateEstado();

  // Estado para la descarga de factura.
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

  const visibles = useMemo(() => {
    const base = Array.isArray(pedidos) ? pedidos : [];
    if (filtro === "todos") return base;
    return base.filter((p) => p.estado === filtro);
  }, [pedidos, filtro]);

  // Acciones disponibles para el admin según el estado actual del pedido.
  // - listo → "Marcar entregado"
  // - entregado → "Descargar factura"
  const renderActions = (p) => {
    if (p.estado === "listo") {
      return (
        <button
          onClick={() => updateEstado.mutate({ id: p.id, estado: "entregado" })}
          disabled={updateEstado.isPending}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
          title="Marcar como entregado"
        >
          <CheckCircle2 size={16} />
          Marcar entregado
        </button>
      );
    }

    if (p.estado === "entregado") {
      return (
        <button
          onClick={() => handleDescargarFactura(p.id)}
          disabled={descargandoId === p.id}
          className="bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white text-sm font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
          title="Descargar factura (PDF)"
        >
          <Download size={16} />
          {descargandoId === p.id ? "Descargando..." : "Descargar factura"}
        </button>
      );
    }

    return null;
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`text-sm font-semibold px-3 py-1.5 rounded-full border transition ${
              filtro === e
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white text-amber-900 border-orange-200 hover:bg-orange-50"
            }`}
          >
            {e.toUpperCase()}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-amber-900/70">Cargando...</p>}
      {isError && (
        <p className="text-red-600">Error al cargar pedidos.</p>
      )}
      {updateEstado.isError && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-3">
          {updateEstado.error?.response?.data?.message ||
            "Error al actualizar el pedido."}
        </div>
      )}
      {errorDescarga && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-3">
          {errorDescarga}
        </div>
      )}

      {!isLoading && visibles.length === 0 && (
        <p className="text-amber-900/60 italic">
          No hay pedidos para este filtro.
        </p>
      )}

      <div className="space-y-3">
        {visibles.map((p) => (
          <OrderCard key={p.id} pedido={p} actions={renderActions(p)} />
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
