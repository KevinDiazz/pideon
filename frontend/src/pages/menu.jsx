import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import ProductList from "../components/productList";
import { categoriesService } from "../services/categoriesService";
import { useUiStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";

// Mapa rol → ruta del panel. El personal interno no ve la carta pública,
// se redirige directo a su panel.
const panelByRole = {
  admin: "/admin",
  cocina: "/cocina",
  repartidor: "/repartidor",
};

const Menu = () => {
  const user = useAuthStore((s) => s.user);
  const panelPath = user ? panelByRole[user.rol] : null;

  const selectedCategoryId = useUiStore((s) => s.selectedCategoryId);
  const { data: categorias = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.list,
    enabled: !panelPath, // si va a redirigir, no pidas categorías
  });

  if (panelPath) return <Navigate to={panelPath} replace />;

  const selected =
    selectedCategoryId && categorias.find((c) => c.id === selectedCategoryId);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 text-white p-5 sm:p-8 md:p-12 mb-6 md:mb-8 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <p className="uppercase tracking-widest text-xs font-bold opacity-90">
            Bienvenido a
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mt-1">PideON</h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-white/90">
            Pide tus platos favoritos con entrega a domicilio o recogida en
            restaurante. Recién hecho, como en casa 🍕
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[10rem] sm:text-[14rem] opacity-20 select-none pointer-events-none">
          🍔
        </div>
      </section>

      {/* Título sección */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-amber-900">
            {selected ? selected.nombre : "Nuestro menú"}
          </h2>
          {selected?.descripcion && (
            <p className="text-amber-900/70 mt-1">{selected.descripcion}</p>
          )}
        </div>
      </div>

      <ProductList />
    </div>
  );
};

export default Menu;
