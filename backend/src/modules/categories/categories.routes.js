import { Router } from "express";
import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "./categories.controller.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

const router = Router();

// 🔓 Rutas públicas
router.get("/", getCategorias);
router.get("/:id", getCategoriaById);

// 🔐 Rutas protegidas (solo admin)
router.post("/", authenticate, authorize("admin"), createCategoria);

router.put("/:id", authenticate, authorize("admin"), updateCategoria);

router.delete("/:id", authenticate, authorize("admin"), deleteCategoria);

export default router;
