// src/modules/pedidos/pedidos.controller.js
import * as pedidosService from "./orders.service.js";
import { streamFacturaPedido } from "./factura.pdf.js";

//Crear un nuevo pedido
export const crearPedido = async (req, res, next) => {
  try {
    const usuarioId = req.user.id; // Obtenido del middleware de autenticación
    const pedido = await pedidosService.crearPedido(usuarioId, req.body);

    return res.status(201).json({
      success: true,
      message: "Pedido creado correctamente",
      data: pedido,
    });
  } catch (error) {
    next(error);
  }
};

//Obtener todos los pedidos
export const obtenerTodos = async (req, res, next) => {
  try {
    const pedidos = await pedidosService.obtenerTodos();

    return res.status(200).json({
      success: true,
      data: pedidos,
    });
  } catch (error) {
    next(error);
  }
};

//Obtener pedidos con estado PENDIENTE
export const obtenerPedidosPendientes = async (req, res, next) => {
  try {
    const pedidos = await pedidosService.obtenerPedidosPendientes();

    return res.status(200).json({
      success: true,
      data: pedidos,
    });
  } catch (error) {
    next(error);
  }
};

//Obtener pedidos con estado LISTO
export const obtenerPedidosListos = async (req, res, next) => {
  try {
    const pedidos = await pedidosService.obtenerPedidosListos();

    return res.status(200).json({
      success: true,
      data: pedidos,
    });
  } catch (error) {
    next(error);
  }
};

//Obtener los pedidos del usuario autenticado
export const obtenerMisPedidos = async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const pedidos = await pedidosService.obtenerPorUsuario(usuarioId);

    return res.status(200).json({
      success: true,
      data: pedidos,
    });
  } catch (error) {
    next(error);
  }
};

//Obtener los pedidos asignados al repartidor autenticado
export const obtenerMisRepartos = async (req, res, next) => {
  try {
    const repartidorId = req.user.id;
    const pedidos = await pedidosService.obtenerPorRepartidor(repartidorId);

    return res.status(200).json({
      success: true,
      data: pedidos,
    });
  } catch (error) {
    next(error);
  }
};

//Obtener un pedido por ID
export const obtenerPorId = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    console.log(id);
    const usuario = req.user;
    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido",
      });
    }

    const pedido = await pedidosService.obtenerPorId(Number(id), usuario);

    return res.status(200).json({
      success: true,
      data: pedido,
    });
  } catch (error) {
    next(error);
  }
};

//Actualizar el estado de un pedido
export const actualizarEstado = async (req, res, next) => {
  try {
    const pedidoId = Number(req.params.id);
    const { estado } = req.body;
    const usuario = req.user;

    if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido inválido",
      });
    }

    const pedido = await pedidosService.actualizarEstado(
      pedidoId,
      estado,
      usuario,
    );

    return res.status(200).json({
      success: true,
      message: "Estado del pedido actualizado correctamente",
      data: pedido,
    });
  } catch (error) {
    next(error);
  }
};

//Asignar un repartidor a un pedido
export const asignarRepartidor = async (req, res, next) => {
  try {
    const pedidoId = Number(req.params.id);
    const repartidorId = req.user.id; // Autoasignación
    if (!Number.isInteger(pedidoId)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido",
      });
    }
    const asignacion = await pedidosService.asignarRepartidor(
      pedidoId,
      repartidorId,
    );

    return res.status(200).json({
      success: true,
      message: "Pedido asignado correctamente al repartidor",
      data: asignacion,
    });
  } catch (error) {
    next(error);
  }
};

//Descargar factura del pedido en PDF (solo si está entregado)
export const descargarFactura = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido",
      });
    }

    const usuario = req.user;
    const pedido = await pedidosService.obtenerPorId(id, usuario);

    if (pedido.estado !== "entregado") {
      return res.status(400).json({
        success: false,
        message:
          "La factura solo está disponible para pedidos en estado 'entregado'.",
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="factura-pedido-${pedido.id}.pdf"`,
    );

    streamFacturaPedido(pedido, res);
  } catch (error) {
    next(error);
  }
};

//Cancelar un pedido (cancelación lógica)
export const cancelarPedido = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido",
      });
    }
    const pedido = await pedidosService.cancelarPedido(Number(id));

    return res.status(200).json({
      success: true,
      message: "Pedido cancelado correctamente",
      data: pedido,
    });
  } catch (error) {
    next(error);
  }
};
