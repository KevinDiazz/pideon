import api from "../api/axios";

export const authService = {
  login: (credentials) =>
    api.post("/auth/login", credentials).then((r) => r.data),
  register: (payload) =>
    api.post("/auth/register", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

export default authService;
