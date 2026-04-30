import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { productsService } from "../services/productsService";
import { useCartStore } from "../store/cartStore";
import { useUiStore } from "../store/uiStore";
import { useAuthStore } from "../store/authStore";

const formatPrecio = (v) => `${Number(v).toFixed(2)} €`;

const ProductCard = ({ producto, onAdd, puedeComprar }) => (
  <article className="bg-white rounded-2xl shadow-sm hover:shadow-md transition border border-orange-100 overflow-hidden flex flex-col">
    <div className="relative aspect-[4/3] bg-orange-50 flex items-center justify-center overflow-hidden">
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="w-full h-full object-contain"
        />
      ) : (
        <span className="text-6xl">🍽️</span>
      )}
      {!producto.disponible && (
        <span className="absolute top-2 left-2 bg-gray-900/80 text-white text-xs font-semibold px-2 py-1 rounded">
          No disponible
        </span>
      )}
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-bold text-amber-900 text-lg">{producto.nombre}</h3>
      {producto.descripcion && (
        <p className="text-sm text-amber-900/70 mt-1 line-clamp-2">
          {producto.descripcion}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-xl font-black text-orange-600">
          {formatPrecio(producto.precio)}
        </span>
        {puedeComprar && (
          <button
            disabled={!producto.disponible}
            onClick={() => onAdd(producto)}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={16} />
            Añadir
          </button>
        )}
      </div>
    </div>
  </article>
);

const ProductList = () => {
  const addItem = useCartStore((s) => s.addItem);
  const selectedCategoryId = useUiStore((s) => s.selectedCategoryId);
  const user = useAuthStore((s) => s.user);
  const esStaff =
    user?.rol === "admin" ||
    user?.rol === "cocina" ||
    user?.rol === "repartidor";
  const puedeComprar = !esStaff;

  const { data: productos = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: productsService.list,
  });

  const filtered = useMemo(() => {
    const base = productos.filter((p) => p.disponible !== false);
    if (!selectedCategoryId) return base;
    return base.filter((p) => p.categoria_id === selectedCategoryId);
  }, [productos, selectedCategoryId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-orange-100 h-72 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        No se pudieron cargar los productos.
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-orange-100 p-10 text-center text-amber-900/70">
        No hay productos en esta categoría todavía.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((p) => (
        <ProductCard
          key={p.id}
          producto={p}
          onAdd={addItem}
          puedeComprar={puedeComprar}
        />
      ))}
    </div>
  );
};

export default ProductList;
