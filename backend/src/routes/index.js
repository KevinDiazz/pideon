import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
//import userRoutes from '../modules/users/user.routes.js';
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import uploadRoutes from "../modules/upload/upload.routes.js";
import categoriesRoutes from "../modules/categories/categories.routes.js";
import productsRoutes from "../modules/products/products.routes.js";
const router = Router();

router.use("/auth", authRoutes);
//router.use('/users', userRoutes);

router.get("/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Bienvenido, administrador" });
}); // ruta protegida
router.use("/upload", uploadRoutes);
router.use("/categories", categoriesRoutes);
router.use("/products", productsRoutes);
export default router;
