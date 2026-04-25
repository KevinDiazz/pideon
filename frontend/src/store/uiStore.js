import { create } from "zustand";

/**
 * UI store — estado volátil de interfaz (filtros, categoría seleccionada,
 * apertura del sidebar en móvil, etc.)
 */
export const useUiStore = create((set) => ({
  selectedCategoryId: null, // null = todas
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  // Sidebar de categorías en móvil (drawer)
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
