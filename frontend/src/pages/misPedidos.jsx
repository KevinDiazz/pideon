import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { ordersService } from "../services/ordersService";

const estadoColor = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
  preparacion: "bg-blue-100 text-blue-800 border-blue-300",
  listo: "bg-emerald-100 text-emerald-800 border-emerald-300",
  reparto: "bg-purple-100 text-purple-800 border-purple-300",
  entregado: "bg-gray-100 text-gray-700 border-gray-300",
};

const formatPrecio = (v) => `${Number(v).toFixed(2)} €`;
const formatFecha = (s) =>
  new Date(s).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });

const MisPedidos = () => {
  const { data: pedidosRaw = [], isLoading } = useQuery({
    queryKey: ["misPedidos"],
    queryFn: ordersService.misPedidos,
  });
  const pedidos = Array.isArray(pedidosRaw) ? pedidosRaw : [];

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

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-black text-amber-900 mb-6">
        Mis pedidos
      </h2>

      {errorDescarga && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm mb-3">
          {errorDescarga}
        </div>
      )}

      {isLoading ? (
        <p className="text-amber-900/70">Cargando...</p>
      ) : pedidos.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-2xl p-8 text-center text-amber-900/70">
          Todavía no has hecho ningún pedido.
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-orange-100 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-amber-900">
                    Pedido #{p.id}{" "}
                    <span className="text-amber-900/60 text-sm font-normal">
                      · {formatFecha(p.created_at)}
                    </span>
                  </p>
                  <p className="text-sm text-amber-900/70">
                    {"📍" + p.entrega_ciudad + " - "} {p.entrega_calle + ", "}
                  </p>
                  <p className="text-sm text-amber-900/70">
                    {"📞" + p.telefono}
                  </p>
                  <p className="text-sm text-amber-900/70">
                    {p.tipo_entrega === "domicilio"
                      ? "🛵 Domicilio"
                      : "🏠 Recogida"}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 border rounded-full ${
                    estadoColor[p.estado] || ""
                  }`}
                >
                  {p.estado.toUpperCase()}
                </span>
              </div>

              {p.lineas?.length > 0 && (
                <ul className="text-sm text-amber-900 space-y-1 mb-3">
                  {p.lineas.map((l) => (
                    <li key={l.id} className="flex justify-between">
                      <span>
                        {l.cantidad}×{" "}
                        {l.producto?.nombre || `Producto #${l.producto_id}`}
                      </span>
                      <span className="text-amber-900/70">
                        {formatPrecio(Number(l.precio_unitario) * l.cantidad)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-orange-100">
                <span className="text-sm text-amber-900/70">Total</span>
                <span className="font-black text-orange-600">
                  {formatPrecio(p.total)}
                </span>
              </div>

              {p.estado === "entregado" && (
                <div className="pt-3 mt-3 border-t border-orange-100 flex justify-end">
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
