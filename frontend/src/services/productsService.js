import api from "../api/axios";

const buildFormData = (payload, file) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      fd.append(key, value);
    }
  });
  if (file) fd.append("imagen", file);
  return fd;
};

export const productsService = {
  list: () => api.get("/products").then((r) => r.data),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data),
  listByCategoria: (categoriaId) =>
    api.get(`/products/categories/${categoriaId}`).then((r) => r.data),
  create: (payload, file) =>
    api
      .post("/products", buildFormData(payload, file), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  update: (id, payload, file) =>
    api
      .put(`/products/${id}`, buildFormData(payload, file), {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

export default productsService;
