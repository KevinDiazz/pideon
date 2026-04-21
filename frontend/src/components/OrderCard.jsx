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

/**
 * Tarjeta de pedido reutilizable para los paneles (cocina, repartidor, admin).
 * Acepta `actions` para renderizar botones al final.
 */
const OrderCard = ({ pedido, actions }) => (
  <div className="bg-white border border-orange-100 rounded-2xl p-3 sm:p-5 shadow-sm">
    <div className="flex items-start justify-between gap-2 mb-3">
      <div className="min-w-0 flex-1">
        <p className="font-bold text-amber-900 break-words">
          Pedido #{pedido.id}{" "}
          <span className="text-amber-900/60 text-sm font-normal">
            · {formatFecha(pedido.created_at)}
          </span>
        </p>
        <p className="text-sm text-amber-900/70 break-words">
          {pedido.tipo_entrega === "domicilio" ? "🛵 Domicilio" : "🏠 Recogida"}
          {pedido.usuario &&
            ` · ${pedido.usuario.nombre} ${pedido.usuario.apellidos || ""}`}
          {pedido.telefono && ` · ☎️ ${pedido.telefono}`}
        </p>
      </div>
      <span
        className={`text-[10px] sm:text-xs font-bold px-2 py-1 border rounded-full shrink-0 ${
          estadoColor[pedido.estado] || ""
        }`}
      >
        {pedido.estado.toUpperCase()}
      </span>
    </div>

    {pedido.tipo_entrega === "domicilio" && pedido.entrega_calle && (
      <p className="text-sm text-amber-900/80 mb-3 break-words">
        📍 {pedido.entrega_calle} {pedido.entrega_numero}
        {pedido.entrega_piso ? `, ${pedido.entrega_piso}` : ""} —{" "}
        {pedido.entrega_cp} {pedido.entrega_ciudad}
      </p>
    )}

    {pedido.lineas?.length > 0 && (
      <ul className="text-sm text-amber-900 space-y-1 mb-3">
        {pedido.lineas.map((l) => (
          <li key={l.id} className="flex justify-between gap-2">
            <span className="min-w-0 break-words">
              {l.cantidad}× {l.producto?.nombre || `Producto #${l.producto_id}`}
            </span>
            <span className="text-amber-900/70 shrink-0">
              {formatPrecio(Number(l.precio_unitario) * l.cantidad)}
            </span>
          </li>
        ))}
      </ul>
    )}

    {pedido.notas && (
      <p className="text-sm italic text-amber-900/70 bg-orange-50 border border-orange-100 rounded-lg p-2 mb-3 break-words">
        📝 {pedido.notas}
      </p>
    )}

    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-orange-100">
      <span className="font-black text-orange-600">
        {formatPrecio(pedido.total)}
      </span>
      {actions && <div className="flex flex-wrap gap-2 justify-end">{actions}</div>}
    </div>
  </div>
);

export default OrderCard;
