import { Navigate, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

const formatPrecio = (v) => `${Number(v).toFixed(2)} €`;

const panelByRole = {
  admin: "/admin",
  cocina: "/cocina",
  repartidor: "/repartidor",
};

const Carrito = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, increment, decrement, removeItem, clearCart } = useCartStore();
  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  // Personal interno no tiene carrito → redirigir a su panel
  if (user && panelByRole[user.rol]) {
    return <Navigate to={panelByRole[user.rol]} replace />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="text-orange-600" size={28} />
        <h2 className="text-2xl md:text-3xl font-black text-amber-900">Tu carrito</h2>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-2xl p-10 text-center">
          <p className="text-6xl mb-3">🛒</p>
          <p className="text-amber-900/70 mb-4">Tu carrito está vacío.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-lg"
          >
            Ver menú
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-orange-100"
              >
                {/* Fila principal: imagen + nombre */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-orange-50 flex items-center justify-center overflow-hidden shrink-0">
                    {item.imagen_url ? (
                      <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-amber-900 break-words">{item.nombre}</h3>
                    <p className="text-xs sm:text-sm text-amber-900/70">{formatPrecio(item.precio)} / ud.</p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1.5 shrink-0"
                    title="Eliminar"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Fila inferior: cantidad + subtotal */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-orange-50">
                  <div className="flex items-center gap-1 bg-orange-50 rounded-lg p-1">
                    <button
                      onClick={() => decrement(item.id)}
                      className="w-8 h-8 rounded-md hover:bg-orange-200 text-orange-700 inline-flex items-center justify-center"
                      aria-label="Quitar uno"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-semibold text-amber-900">{item.cantidad}</span>
                    <button
                      onClick={() => increment(item.id)}
                      className="w-8 h-8 rounded-md hover:bg-orange-200 text-orange-700 inline-flex items-center justify-center"
                      aria-label="Añadir uno"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="font-bold text-orange-600">
                    {formatPrecio(item.precio * item.cantidad)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-white border border-orange-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-amber-900/70">Total</p>
              <p className="text-3xl font-black text-orange-600">{formatPrecio(total)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-lg"
              >
                Vaciar
              </button>
              <button
                onClick={() => navigate(user ? "/checkout" : "/login")}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-lg"
              >
                {user ? "Ir a pagar" : "Inicia sesión para pagar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Carrito;
