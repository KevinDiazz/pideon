import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
//import userRoutes from '../modules/users/user.routes.js';
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
const router = Router();

router.use("/auth", authRoutes);
//router.use('/users', userRoutes);

router.get("/admin", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Bienvenido, administrador" });
}); // ruta protegida

export default router;
