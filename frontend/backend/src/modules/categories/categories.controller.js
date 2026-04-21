import * as categoriaService from "./categories.service.js";

// Obtener todas las categorías
export const getCategorias = async (req, res, next) => {
  try {
    const categorias = await categoriaService.getCategorias();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
};

// Obtener una categoría por ID
export const getCategoriaById = async (req, res, next) => {
  try {
    const categoria = await categoriaService.getCategoriaById(
      Number(req.params.id),
    );

    if (!categoria) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

// Crear una nueva categoría
export const createCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion, orden } = req.body;

    const categoria = await categoriaService.createCategoria({
      nombre,
      descripcion,
      orden: orden !== undefined ? Number(orden) : 0,
    });

    res.status(201).json(categoria);
  } catch (error) {
    next(error);
  }
};

// Actualizar una categoría
export const updateCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion, activa } = req.body;

    const categoria = await categoriaService.updateCategoria(
      Number(req.params.id),
      {
        nombre,
        descripcion,
        activa:
          activa !== undefined
            ? activa === "true" || activa === true
            : undefined,
      },
    );

    res.json(categoria);
  } catch (error) {
    next(error);
  }
};

// Eliminación lógica de una categoría
export const deleteCategoria = async (req, res, next) => {
  try {
    await categoriaService.deleteCategoria(Number(req.params.id));
    res.json({ message: "Categoría desactivada correctamente" });
  } catch (error) {
    next(error);
  }
};
