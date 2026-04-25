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
  misRepartos: () => api.get("/orders/mis-repartos").then(unwrap),
  all: () => api.get("/orders").then(unwrap),
  getById: (id) => api.get(`/orders/${id}`).then(unwrap),
  updateEstado: (id, estado) =>
    api.patch(`/orders/${id}/estado`, { estado }).then(unwrap),
  autoAsignar: (id) =>
    api.patch(`/orders/${id}/asignar-repartidor`).then(unwrap),

  // Descarga la factura del pedido. El backend devuelve un PDF binario,
  // así que pedimos `responseType: "blob"` y NO desenvolvemos `data`.
  descargarFactura: async (id) => {
    const res = await api.get(`/orders/${id}/factura`, {
      responseType: "blob",
    });
    return res.data; // Blob con el PDF
  },

  // Helper: descarga el PDF y dispara la descarga en el navegador.
  // Devuelve una promesa que resuelve cuando la descarga se ha lanzado.
  descargarFacturaYGuardar: async (id) => {
    const blob = await ordersService.descargarFactura(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factura-pedido-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Dejamos un pequeño margen antes de revocar para que el navegador
    // tenga tiempo de iniciar la descarga.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};

export default ordersService;
