import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Límite de 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no válido. Solo JPG, PNG o WEBP.'));
    }
  },
});

export default upload;