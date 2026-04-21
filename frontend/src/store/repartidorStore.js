import { create } from "zustand";

/**
 * Almacena localmente qué pedidos tiene el repartidor actualmente "en curso"
 * (asignados o en reparto). Como el backend `/orders/listos` no devuelve los
 * que ya están en estado "reparto", necesitamos rastrearlos en el cliente
 * para poder seguir pidiendo `/orders/:id` y ver su estado hasta entregarlos.
 *
 * La clave del storage depende del id del repartidor para que distintos
 * usuarios en el mismo navegador no se mezclen.
 */
const STORAGE_PREFIX = "pideon.repartidor.misIds.";

const storageKey = (userId) => `${STORAGE_PREFIX}${userId || "anon"}`;

const loadIds = (userId) => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveIds = (userId, ids) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(ids));
  } catch {
    // ignore
  }
};

export const useRepartidorStore = create((set, get) => ({
  userId: null,
  ids: [],

  init: (userId) => {
    set({ userId, ids: loadIds(userId) });
  },

  addId: (id) => {
    const { userId, ids } = get();
    if (ids.includes(id)) return;
    const next = [...ids, id];
    saveIds(userId, next);
    set({ ids: next });
  },

  removeId: (id) => {
    const { userId, ids } = get();
    const next = ids.filter((x) => x !== id);
    saveIds(userId, next);
    set({ ids: next });
  },

  clear: () => {
    const { userId } = get();
    saveIds(userId, []);
    set({ ids: [] });
  },
}));
