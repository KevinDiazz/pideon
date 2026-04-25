import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  UserCircle2,
  LogOut,
  Shield,
  ChefHat,
  Bike,
  Menu as MenuIcon,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useUiStore } from "../store/uiStore";

const roleConfig = {
  admin: {
    label: "Panel admin",
    path: "/admin",
    Icon: Shield,
    color: "bg-red-600 hover:bg-red-700",
  },
  cocina: {
    label: "Panel cocina",
    path: "/cocina",
    Icon: ChefHat,
    color: "bg-amber-600 hover:bg-amber-700",
  },
  repartidor: {
    label: "Mis repartos",
    path: "/repartidor",
    Icon: Bike,
    color: "bg-emerald-600 hover:bg-emerald-700",
  },
};

const Navbar = ({ showHamburger = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const count = useCartStore((s) => s.count());
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const role = user ? roleConfig[user.rol] : null;

  // Solo los clientes (y visitantes no logueados) pueden pedir.
  // admin / cocina / repartidor no ven carrito ni "Mis pedidos".
  const esStaff =
    user?.rol === "admin" ||
    user?.rol === "cocina" ||
    user?.rol === "repartidor";
  const puedeComprar = !esStaff;

  return (
    <header className="bg-white/90 backdrop-blur border-b border-orange-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Hamburguesa — solo en móvil y cuando haya sidebar */}
          {showHamburger && (
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 -ml-1 rounded-lg text-amber-900 hover:bg-orange-100"
              aria-label="Abrir menú de categorías"
            >
              <MenuIcon size={22} />
            </button>
          )}

          <Link to="/" className="flex items-center gap-1.5 min-w-0">
            <span className="text-xl sm:text-2xl">🍕</span>
            <span className="text-xl sm:text-2xl font-black text-orange-600 tracking-tight">
              PideON
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* Botón panel por rol */}
          {role && (
            <button
              onClick={() => navigate(role.path)}
              className={`${role.color} text-white text-sm font-semibold px-2.5 sm:px-3 md:px-4 py-2 rounded-lg inline-flex items-center gap-2 shadow-sm`}
              title={role.label}
            >
              <role.Icon size={16} />
              <span className="hidden sm:inline">{role.label}</span>
            </button>
          )}

          {/* Mis pedidos — clientes */}
          {user?.rol === "cliente" && (
            <button
              onClick={() => navigate("/mis-pedidos")}
              className="text-amber-900 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-orange-100 hidden sm:inline-flex"
            >
              Mis pedidos
            </button>
          )}

          {/* Carrito — solo para clientes / invitados */}
          {puedeComprar && (
            <button
              onClick={() => navigate("/carrito")}
              className="relative bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold px-2.5 sm:px-3 py-2 rounded-lg inline-flex items-center gap-2"
              aria-label="Carrito"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Carrito</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 inline-flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          )}

          {/* Login / Usuario */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden lg:flex items-center gap-2 text-sm text-amber-900">
                <UserCircle2 size={18} />
                <span className="font-medium">{user.nombre}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 sm:px-3 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline text-sm">Salir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg text-sm"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
