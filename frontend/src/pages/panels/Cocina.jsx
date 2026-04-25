import { useQuery } from "@tanstack/react-query";
import { ChefHat } from "lucide-react";
import { ordersService } from "../../services/ordersService";
import OrderCard from "../../components/OrderCard";
import {
  pedidoQueryOptions,
  useUpdateEstado,
} from "../../hooks/usePedidoMutations";

const Cocina = () => {
  /**
   * Una sola query a /orders: así ambas columnas (pendientes y en preparación)
   * salen del mismo cache y el update optimista funciona al instante.
   */
  const { data: todosRaw = [], isLoading, isError } = useQuery({
    queryKey: ["pedidos", "all"],
    queryFn: ordersService.all,
    ...pedidoQueryOptions,
  });

  const todos = Array.isArray(todosRaw) ? todosRaw : [];

  // Pendientes: FIFO por fecha de creación (los más antiguos primero).
  const pendientes = todos
    .filter((p) => p.estado === "pendiente")
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  // En preparación: cola por el momento en el que pasaron a "preparacion"
  // (updated_at ASC). Así los que acaban de entrar van al final.
  const enPreparacion = todos
    .filter((p) => p.estado === "preparacion")
    .sort(
      (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    );

  const updateEstado = useUpdateEstado();

  const btn = (label, color, onClick) => (
    <button
      onClick={onClick}
      disabled={updateEstado.isPending}
      className={`${color} text-white text-sm font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ChefHat className="text-amber-600" size={28} />
        <h2 className="text-2xl md:text-3xl font-black text-amber-900">
          Panel de cocina
        </h2>
      </div>

      {(updateEstado.isError || isError) && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-4">
          {updateEstado.error?.response?.data?.message ||
            "Error al actualizar el pedido."}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h3 className="text-lg font-bold text-amber-900 mb-3">
            🟡 Pendientes ({pendientes.length})
          </h3>
          {isLoading ? (
            <p className="text-amber-900/70">Cargando...</p>
          ) : pendientes.length === 0 ? (
            <p className="text-amber-900/60 italic">Sin pedidos pendientes.</p>
          ) : (
            <div className="space-y-3">
              {pendientes.map((p) => (
                <OrderCard
                  key={p.id}
                  pedido={p}
                  actions={btn(
                    "Empezar a preparar",
                    "bg-blue-600 hover:bg-blue-700",
                    () =>
                      updateEstado.mutate({ id: p.id, estado: "preparacion" })
                  )}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-lg font-bold text-amber-900 mb-3">
            🔵 En preparación ({enPreparacion.length})
          </h3>
          {enPreparacion.length === 0 ? (
            <p className="text-amber-900/60 italic">Nada en preparación.</p>
          ) : (
            <div className="space-y-3">
              {enPreparacion.map((p) => (
                <OrderCard
                  key={p.id}
                  pedido={p}
                  actions={
                    <>
                      {btn(
                        "Marcar listo",
                        "bg-emerald-600 hover:bg-emerald-700",
                        () =>
                          updateEstado.mutate({ id: p.id, estado: "listo" })
                      )}
                      {btn(
                        "Volver a pendiente",
                        "bg-gray-500 hover:bg-gray-600",
                        () =>
                          updateEstado.mutate({
                            id: p.id,
                            estado: "pendiente",
                          })
                      )}
                    </>
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Cocina;
