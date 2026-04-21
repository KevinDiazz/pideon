import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersService } from "../../services/ordersService";
import OrderCard from "../../components/OrderCard";

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
    refetchInterval: 20_000,
  });

  const visibles = useMemo(() => {
    const base = Array.isArray(pedidos) ? pedidos : [];
    if (filtro === "todos") return base;
    return base.filter((p) => p.estado === filtro);
  }, [pedidos, filtro]);

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

      {!isLoading && visibles.length === 0 && (
        <p className="text-amber-900/60 italic">
          No hay pedidos para este filtro.
        </p>
      )}

      <div className="space-y-3">
        {visibles.map((p) => (
          <OrderCard key={p.id} pedido={p} />
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
