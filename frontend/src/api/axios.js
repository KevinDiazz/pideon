import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔐 Interceptor para añadir token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Si no es FormData ponemos JSON por defecto
    if (
      config.data &&
      typeof FormData !== "undefined" &&
      !(config.data instanceof FormData) &&
      !config.headers["Content-Type"]
    ) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Interceptor de respuesta — limpia token si 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token inválido — limpiamos para evitar estados rotos
      const path = window.location.pathname;
      if (!["/login", "/register"].includes(path)) {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
