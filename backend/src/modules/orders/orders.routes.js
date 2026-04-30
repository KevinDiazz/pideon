// src/modules/orders/orders.routes.js
import { Router } from "express";
import * as controller from "./orders.controller.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

const router = Router();

router.post("/", authenticate, authorize("cliente"), controller.crearPedido);


// Pedidos del cliente autenticado
router.get(
  "/mis-pedidos",
  authenticate,
  authorize("cliente"),
  controller.obtenerMisPedidos,
);

// Pedidos pendientes para cocina/admin
router.get(
  "/pendientes",
  authenticate,
  authorize("cocina", "admin"),
  controller.obtenerPedidosPendientes,
);

// Pedidos listos para reparto
router.get(
  "/listos",
  authenticate,
  authorize("repartidor", "admin"),
  controller.obtenerPedidosListos,
);

// Pedidos asignados al repartidor autenticado (reparto + entregado)
router.get(
  "/mis-repartos",
  authenticate,
  authorize("repartidor", "admin"),
  controller.obtenerMisRepartos,
);

// Obtener todos los pedidos (admin/cocina)
router.get(
  "/",
  authenticate,
  authorize("admin", "cocina"),
  controller.obtenerTodos,
);


// Solo acepta IDs numéricos para evitar conflictos
router.get(
  "/:id",
  authenticate,
  authorize("admin", "cocina", "repartidor"),
  controller.obtenerPorId,
);

// Descargar factura PDF de un pedido entregado
router.get(
  "/:id/factura",
  authenticate,
  authorize("admin", "cocina", "repartidor", "cliente"),
  controller.descargarFactura,
);


// Actualizar estado del pedido
router.patch(
  "/:id/estado",
  authenticate,
  authorize("admin", "cocina","repartidor"),
  controller.actualizarEstado,
);

// Autoasignación de repartidor
router.patch(
  "/:id/asignar-repartidor",
  authenticate,
  authorize("repartidor"),
  controller.asignarRepartidor,
);

export default router;
