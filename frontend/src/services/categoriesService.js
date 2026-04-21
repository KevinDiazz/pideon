import api from "../api/axios";

export const categoriesService = {
  list: () => api.get("/categories").then((r) => r.data),
  getById: (id) => api.get(`/categories/${id}`).then((r) => r.data),
  create: (payload) => api.post("/categories", payload).then((r) => r.data),
  update: (id, payload) =>
    api.put(`/categories/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};

export default categoriesService;
