import * as categoriaRepository from './categories.repository.js';

// Obtener todas las categorías activas
export const getCategorias = async () => {
  return await categoriaRepository.findAll();
};

// Obtener una categoría por ID
export const getCategoriaById = async (id) => {
  return await categoriaRepository.findById(id);
};

// Crear una nueva categoría con validación de duplicados
export const createCategoria = async (data) => {
  const existing = await categoriaRepository.findByNombre(data.nombre);

  if (existing) {
    const error = new Error('Ya existe una categoría con ese nombre');
    error.statusCode = 400;
    throw error;
  }

  return await categoriaRepository.create(data);
};

// Actualizar una categoría
export const updateCategoria = async (id, data) => {
  return await categoriaRepository.update(id, data);
};

// Eliminación lógica
export const deleteCategoria = async (id) => {
  return await categoriaRepository.softDelete(id);
};