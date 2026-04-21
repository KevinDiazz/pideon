import { create } from "zustand";

const STORAGE_KEY = "pideon.cart";

const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const persist = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // no-op
  }
};

export const useCartStore = create((set, get) => ({
  items: loadInitial(),

  addItem: (producto) => {
    const items = [...get().items];
    const idx = items.findIndex((i) => i.id === producto.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], cantidad: items[idx].cantidad + 1 };
    } else {
      items.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        imagen_url: producto.imagen_url || null,
        cantidad: 1,
      });
    }
    persist(items);
    set({ items });
  },

  setQuantity: (id, cantidad) => {
    const items = get()
      .items.map((i) => (i.id === id ? { ...i, cantidad } : i))
      .filter((i) => i.cantidad > 0);
    persist(items);
    set({ items });
  },

  increment: (id) => {
    const items = get().items.map((i) =>
      i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i
    );
    persist(items);
    set({ items });
  },

  decrement: (id) => {
    const items = get()
      .items.map((i) =>
        i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i
      )
      .filter((i) => i.cantidad > 0);
    persist(items);
    set({ items });
  },

  removeItem: (id) => {
    const items = get().items.filter((i) => i.id !== id);
    persist(items);
    set({ items });
  },

  clearCart: () => {
    persist([]);
    set({ items: [] });
  },

  total: () =>
    get().items.reduce((acc, i) => acc + Number(i.precio) * i.cantidad, 0),

  count: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
}));
