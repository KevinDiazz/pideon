import * as service from "../../../modules/orders/orders.service.js";
import {
  crearPedido,
  actualizarEstado,
} from "../../../modules/orders/orders.controller.js";

jest.mock("../../../modules/orders/orders.service.js");

describe("orders.controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // CREAR PEDIDO
  // =========================

  test("crearPedido → 201 OK", async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    service.crearPedido.mockResolvedValue({ id: 1 });

    await crearPedido(req, res, next);

    expect(service.crearPedido).toHaveBeenCalledWith(1, {});
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Pedido creado correctamente",
      data: { id: 1 },
    });
  });

  test("crearPedido → error pasa a next", async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = {};
    const next = jest.fn();

    service.crearPedido.mockRejectedValue(new Error("fail"));

    await crearPedido(req, res, next);

    expect(next).toHaveBeenCalled(); // 🔥 importante
  });

  // =========================
  // ACTUALIZAR ESTADO
  // =========================

  test("actualizarEstado → OK", async () => {
    const req = {
      params: { id: "1" }, // 👈 Express siempre string
      body: { estado: "listo" },
      user: { id: 1, rol: "admin" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    service.actualizarEstado.mockResolvedValue({ estado: "listo" });

    await actualizarEstado(req, res, next);

    expect(service.actualizarEstado).toHaveBeenCalledWith(1, "listo", req.user);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Estado del pedido actualizado correctamente",
      data: { estado: "listo" },
    });
  });

  test("actualizarEstado → error pasa a next", async () => {
    const req = {
      params: { id: "1" },
      body: { estado: "listo" },
      user: { id: 1, rol: "admin" },
    };

    const res = {};
    const next = jest.fn();

    service.actualizarEstado.mockRejectedValue(new Error("fail"));

    await actualizarEstado(req, res, next);

    expect(next).toHaveBeenCalled(); // 🔥 clave
  });
});
