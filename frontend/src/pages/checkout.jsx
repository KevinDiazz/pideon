import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { ordersService } from "../services/ordersService";

const formatPrecio = (v) => `${Number(v).toFixed(2)} €`;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const total = useMemo(
    () => items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
    [items]
  );

  const [form, setForm] = useState({
    tipo_entrega: "domicilio",
    telefono: "",
    entrega_calle: "",
    entrega_numero: "",
    entrega_piso: "",
    entrega_ciudad: "",
    entrega_cp: "",
    metodo_pago: "tarjeta",
    notas: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const payload = {
        tipo_entrega: form.tipo_entrega,
        telefono: form.telefono,
        metodo_pago: form.metodo_pago,
        notas: form.notas || undefined,
        lineas: items.map((i) => ({
          producto_id: i.id,
          cantidad: i.cantidad,
          notas_linea: undefined,
        })),
      };

      if (form.tipo_entrega === "domicilio") {
        Object.assign(payload, {
          entrega_calle: form.entrega_calle,
          entrega_numero: form.entrega_numero,
          entrega_piso: form.entrega_piso || undefined,
          entrega_ciudad: form.entrega_ciudad,
          entrega_cp: form.entrega_cp,
        });
      }

      const res = await ordersService.create(payload);
      clearCart();
      // `ordersService.create` ya desenvuelve `data`, así que `res` es el pedido.
      setSuccess(res);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo crear el pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-orange-100 rounded-2xl p-8 text-center shadow-sm">
        <p className="text-6xl mb-3">✅</p>
        <h2 className="text-2xl font-black text-amber-900 mb-2">
          ¡Pedido realizado!
        </h2>
        <p className="text-amber-900/70">
          Número de pedido: <span className="font-semibold">#{success?.id}</span>
        </p>
        <div className="mt-6 flex gap-2 justify-center">
          <button
            onClick={() => navigate("/mis-pedidos")}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Ver mis pedidos
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg"
          >
            Seguir pidiendo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-black text-amber-900 mb-6">
        Finalizar pedido
      </h2>

      {items.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-2xl p-8 text-center">
          <p className="text-amber-900/70 mb-4">
            No hay productos en el carrito.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Ver menú
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-2 bg-white border border-orange-100 rounded-2xl p-4 sm:p-5 space-y-5">
            <div>
              <h3 className="font-bold text-amber-900 mb-2">Tipo de entrega</h3>
              <div className="flex gap-2">
                {[
                  { k: "domicilio", label: "🛵 A domicilio" },
                  { k: "recogida", label: "🏠 Recogida" },
                ].map((o) => (
                  <label
                    key={o.k}
                    className={`flex-1 cursor-pointer border rounded-lg px-3 py-2 text-center font-semibold transition ${
                      form.tipo_entrega === o.k
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-orange-200 text-amber-900 hover:bg-orange-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipo_entrega"
                      value={o.k}
                      checked={form.tipo_entrega === o.k}
                      onChange={onChange}
                      className="sr-only"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Teléfono de contacto
              </label>
              <input
                name="telefono"
                required
                value={form.telefono}
                onChange={onChange}
                placeholder="600000000"
                className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {form.tipo_entrega === "domicilio" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-amber-900 mb-1">
                    Calle
                  </label>
                  <input
                    name="entrega_calle"
                    required
                    value={form.entrega_calle}
                    onChange={onChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-1">
                    Número
                  </label>
                  <input
                    name="entrega_numero"
                    required
                    value={form.entrega_numero}
                    onChange={onChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-1">
                    Piso (opcional)
                  </label>
                  <input
                    name="entrega_piso"
                    value={form.entrega_piso}
                    onChange={onChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-1">
                    Ciudad
                  </label>
                  <input
                    name="entrega_ciudad"
                    required
                    value={form.entrega_ciudad}
                    onChange={onChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-900 mb-1">
                    Código postal
                  </label>
                  <input
                    name="entrega_cp"
                    required
                    value={form.entrega_cp}
                    onChange={onChange}
                    className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-amber-900 mb-2">Método de pago</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { k: "tarjeta", label: "💳 Tarjeta" },
                  { k: "efectivo", label: "💶 Efectivo" },
                  { k: "bizum", label: "📱 Bizum" },
                ].map((o) => (
                  <label
                    key={o.k}
                    className={`cursor-pointer border rounded-lg px-3 py-2 font-semibold transition ${
                      form.metodo_pago === o.k
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-orange-200 text-amber-900 hover:bg-orange-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodo_pago"
                      value={o.k}
                      checked={form.metodo_pago === o.k}
                      onChange={onChange}
                      className="sr-only"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-1">
                Notas (opcional)
              </label>
              <textarea
                name="notas"
                value={form.notas}
                onChange={onChange}
                rows={2}
                placeholder="Sin cebolla, timbre estropeado..."
                className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm">
                {error}
              </div>
            )}
          </div>

          <aside className="bg-white border border-orange-100 rounded-2xl p-4 sm:p-5 h-fit md:sticky md:top-20">
            <h3 className="font-bold text-amber-900 mb-3">Resumen</h3>
            <ul className="space-y-2 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span className="text-amber-900">
                    {i.cantidad}× {i.nombre}
                  </span>
                  <span className="text-amber-900/70">
                    {formatPrecio(i.precio * i.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-orange-100 flex items-center justify-between">
              <span className="font-semibold text-amber-900">Total</span>
              <span className="text-2xl font-black text-orange-600">
                {formatPrecio(total)}
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? "Enviando..." : "Confirmar pedido"}
            </button>
          </aside>
        </form>
      )}
    </div>
  );
};

export default Checkout;
