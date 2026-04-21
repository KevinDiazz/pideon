// src/modules/productos/productos.repository.js
import prisma from "../../../prisma/config/prisma.js";

//Obtener todos los productos disponibles
export const getAllProductos = async () => {
  return await prisma.producto.findMany({
    where: {
      disponible: true,
      categoria: {
        activa: true,
      },
    },
    include: {
      categoria: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });
};

//Obtener un producto por su ID
export const getProductoById = async (id) => {
  return await prisma.producto.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      categoria: true,
    },
  });
};

//Crear un nuevo producto
export const createProducto = async (data) => {
  return await prisma.producto.create({
    data,
    include: {
      categoria: true,
    },
  });
};
// Actualizar un producto
export const updateProducto = async (id, data) => {
  return await prisma.producto.update({
    where: {
      id: Number(id),
    },
    data,
    include: {
      categoria: true,
    },
  });
};

// Eliminación lógica de un producto
export const deleteProducto = async (id) => {
  return await prisma.producto.update({
    where: {
      id: Number(id),
    },
    data: {
      disponible: false,
    },
  });
};

//Verificar si existe un producto con el mismo nombre (case insensitive)
export const existsProductoByNombre = async (nombre) => {
  return await prisma.producto.findFirst({
    where: {
      nombre: {
        equals: nombre,
        mode: "insensitive",
      },
      disponible: true,
    },
  });
};

//Obtener una categoría por su ID
export const getCategoriaById = async (id) => {
  return await prisma.categoria.findUnique({
    where: {
      id: Number(id),
    },
  });
};

//Obtener productos por categoria
export const getProductosByCategoria = async (categoria_id) => {
  return await prisma.producto.findMany({
    where: {
      categoria_id: Number(categoria_id),
      disponible: true,
      categoria: {
        activa: true,
      },
    },
    include: {
      categoria: true,
    },
    orderBy: {
      nombre: "asc",
    },
  });
};
