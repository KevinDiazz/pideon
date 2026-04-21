import { create } from "zustand";
import api from "../api/axios";

const initialToken = localStorage.getItem("token") || null;

export const useAuthStore = create((set, get) => ({
  user: null,
  token: initialToken,
  // Si hay token al arrancar, estamos verificándolo contra /auth/me
  loading: Boolean(initialToken),

  // 🔐 LOGIN
  login: async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token });
    return data.user;
  },

  // 📝 REGISTER
  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  // 🚪 LOGOUT
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  // 🔄 Cargar el perfil del usuario a partir del token (/auth/me)
  loadMe: async () => {
    const token = get().token || localStorage.getItem("token");
    if (!token) return;
    try {
      set({ loading: true });
      const { data } = await api.get("/auth/me");
      set({ user: data, token, loading: false });
    } catch (err) {
      // Token inválido o caducado → limpiar sesión
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
