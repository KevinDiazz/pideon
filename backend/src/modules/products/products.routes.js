// src/modules/productos/productos.routes.js
import { Router } from "express";
import {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  getProductosByCategoria,
} from "./products.controller.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";
import upload from "../../middlewares/upload.js";

const router = Router();

// Públicas
router.get("/", getAllProductos);
router.get("/:id", getProductoById);
router.get("/categories/:categoria_id", getProductosByCategoria);

// Protegidas (solo admin)
router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.single("imagen"),
  createProducto,
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  upload.single("imagen"),
  updateProducto,
);

router.delete("/:id", authenticate, authorize("admin"), deleteProducto);

export default router;
