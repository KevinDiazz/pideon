import { Router } from "express";
import { register, login, getMe } from "./auth.controller.js";
import { registerValidation, loginValidation } from "./auth.validation.js";
import validationMiddleware from "../../middlewares/validation.middleware.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
const router = Router();

router.post("/register", registerValidation, validationMiddleware, register);
router.post("/login", loginValidation, validationMiddleware, login);
router.get("/me", authenticate, getMe);
export default router;
