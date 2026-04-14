import prisma from "../../../prisma/config/prisma.js";

// Obtener todas las categorías activas
export const findAll = () => {
  return prisma.categoria.findMany({
    where: { activa: true },
    orderBy: { nombre: 'asc' },
  });
};

// Obtener una categoría por ID
export const findById = (id) => {
  return prisma.categoria.findUnique({
    where: { id },
  });
};

// Buscar una categoría por nombre (para evitar duplicados)
export const findByNombre = (nombre) => {
  return prisma.categoria.findUnique({
    where: { nombre },
  });
};

// Crear una nueva categoría
export const create = (data) => {
  return prisma.categoria.create({ data });
};

// Actualizar una categoría
export const update = (id, data) => {
  return prisma.categoria.update({
    where: { id },
    data,
  });
};

// Eliminación lógica (desactivar)
export const softDelete = (id) => {
  return prisma.categoria.update({
    where: { id },
    data: { activa: false },
  });
};
