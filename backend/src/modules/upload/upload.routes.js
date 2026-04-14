import { Router } from "express";
import upload from "../../middlewares/upload.js";
import { authenticate } from "../../middlewares/authenticate.middleware.js";
import { authorize } from "../../middlewares/authorize.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("admin"),
  upload.single("imagen"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "No se ha subido ninguna imagen",
      });
    }

    res.status(200).json({
      message: "Imagen subida correctamente",
      imagen_url: req.file.path, // URL pública de Cloudinary
      public_id: req.file.filename, // Identificador para futuras eliminaciones
    });
  },
);

export default router;
