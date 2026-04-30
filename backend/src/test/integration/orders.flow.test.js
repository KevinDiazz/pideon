import request from "supertest";
import app from "../../app.js";

// 🔧 mock controller (simple pero controlado)
jest.mock("../../modules/orders/orders.controller.js", () => ({
  crearPedido: jest.fn((req, res) => res.status(201).json({ id: 1 })),
  obtenerMisPedidos: jest.fn((req, res) => res.json([])),
  obtenerPedidosPendientes: jest.fn((req, res) => res.json([])),
  obtenerPedidosListos: jest.fn((req, res) => res.json([])),
  obtenerMisRepartos: jest.fn((req, res) => res.json([])),
  obtenerTodos: jest.fn((req, res) => res.json([])),
  obtenerPorId: jest.fn((req, res) => res.json({ id: 1 })),
  descargarFactura: jest.fn((req, res) => res.send("PDF")),
  actualizarEstado: jest.fn((req, res) =>
    res.json({ estado: req.body.estado }),
  ),
  asignarRepartidor: jest.fn((req, res) => res.json({ asignado: true })),
}));

// 🔧 rol dinámico
let mockRole = "cliente";

jest.mock("../../middlewares/authenticate.middleware.js", () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, rol: mockRole };
    next();
  },
}));

jest.mock("../../middlewares/authorize.middleware.js", () => ({
  authorize:
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.rol)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    },
}));

describe("Pedido flow completo", () => {
  test("flujo completo: cliente → cocina → repartidor → entrega", async () => {
    mockRole = "cliente";

    const createRes = await request(app)
      .post("/api/orders")
      .send({
        lineas: [{ producto_id: 1, cantidad: 1 }],
      });

    expect(createRes.statusCode).toBe(201);

    const pedidoId = createRes.body.id;

    mockRole = "cocina";

    const prepRes = await request(app)
      .patch(`/api/orders/${pedidoId}/estado`)
      .send({ estado: "preparacion" });

    expect(prepRes.statusCode).toBe(200);

    const listoRes = await request(app)
      .patch(`/api/orders/${pedidoId}/estado`)
      .send({ estado: "listo" });

    expect(listoRes.statusCode).toBe(200);

    mockRole = "repartidor";

    const asignarRes = await request(app).patch(
      `/api/orders/${pedidoId}/asignar-repartidor`,
    );

    expect(asignarRes.statusCode).toBe(200);

    // =========================
    // 5. REPARTIDOR → ENTREGAR
    // =========================
    const entregarRes = await request(app)
      .patch(`/api/orders/${pedidoId}/estado`)
      .send({ estado: "entregado" });

    expect(entregarRes.statusCode).toBe(200);
  });
});
