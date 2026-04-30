import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { UtensilsCrossed, X } from "lucide-react";
import { categoriesService } from "../services/categoriesService";
import { useUiStore } from "../store/uiStore";
import ColdStartLoader from "./ColdStartLoader";

/**
 * Sidebar de categorías con dos modos:
 *  - Desktop (md+): columna fija a la izquierda, siempre visible.
 *  - Móvil (<md): drawer que se abre con el botón hamburguesa de la navbar.
 *    Se cierra con X, tocando el backdrop, pulsando Esc o eligiendo categoría.
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCategoryId, setSelectedCategoryId } = useUiStore();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);

  const { data: categorias = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.list,
  });

  const activas = categorias.filter((c) => c.activa !== false);

  // Cierre con Escape en móvil
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e) => e.key === "Escape" && closeSidebar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen, closeSidebar]);

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const pick = (id) => {
    setSelectedCategoryId(id);
    closeSidebar();
    // Si el usuario está en otra página (carrito, checkout, mis-pedidos...),
    // al elegir una categoría lo llevamos a la carta para que vea los productos.
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="text-orange-600" size={20} />
          <h2 className="font-bold text-amber-900">Categorías</h2>
        </div>
        {/* Cerrar — solo visible en móvil */}
        <button
          onClick={closeSidebar}
          className="md:hidden text-amber-900/70 hover:text-amber-900 p-1"
          aria-label="Cerrar categorías"
        >
          <X size={20} />
        </button>
      </div>

      {isLoading && <p className="text-sm text-amber-900/60">Cargando...</p>}
      {isError && <ColdStartLoader onRetry={refetch} variant="compact" />}

      <ul className="space-y-1">
        <li>
          <button
            onClick={() => pick(null)}
            className={`w-full text-left px-3 py-2 rounded-lg transition ${
              selectedCategoryId === null
                ? "bg-orange-600 text-white font-semibold shadow"
                : "hover:bg-orange-100 text-amber-900"
            }`}
          >
            Todas
          </button>
        </li>
        {activas.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => pick(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${
                selectedCategoryId === cat.id
                  ? "bg-orange-600 text-white font-semibold shadow"
                  : "hover:bg-orange-100 text-amber-900"
              }`}
            >
              {cat.nombre}
            </button>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <>
      {/* Sidebar fijo en desktop */}
      <aside className="hidden md:block w-56 md:w-64 bg-white border-r border-orange-100 p-4 shrink-0">
        {content}
      </aside>

      {/* Drawer móvil */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition ${
          sidebarOpen
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
        aria-hidden={!sidebarOpen}
      >
        {/* Backdrop */}
        <div
          onClick={closeSidebar}
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Panel */}
        <aside
          className={`absolute top-0 left-0 h-full w-72 max-w-[80%] bg-white border-r border-orange-100 p-4 shadow-xl transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          role="dialog"
          aria-label="Categorías"
        >
          {content}
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
