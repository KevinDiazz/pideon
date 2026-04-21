import api from "../api/axios";

/**
 * El backend de pedidos devuelve { success: true, data: ... }.
 * Desenvolvemos `data` aquí para que las pantallas reciban directamente
 * el array o el objeto del pedido.
 */
const unwrap = (r) => (r.data && "data" in r.data ? r.data.data : r.data);

export const ordersService = {
  create: (payload) => api.post("/orders", payload).then(unwrap),
  misPedidos: () => api.get("/orders/mis-pedidos").then(unwrap),
  pendientes: () => api.get("/orders/pendientes").then(unwrap),
  listos: () => api.get("/orders/listos").then(unwrap),
  all: () => api.get("/orders").then(unwrap),
  getById: (id) => api.get(`/orders/${id}`).then(unwrap),
  updateEstado: (id, estado) =>
    api.patch(`/orders/${id}/estado`, { estado }).then(unwrap),
  autoAsignar: (id) =>
    api.patch(`/orders/${id}/asignar-repartidor`).then(unwrap),
};

export default ordersService;
