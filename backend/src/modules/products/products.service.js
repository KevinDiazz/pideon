// src/modules/productos/productos.service.js
import * as repository from "./products.repository.js";
import { v2 as cloudinary } from "cloudinary";
/**
 * Obtener todos los productos disponibles
 */
export const getAllProductos = async () => {
  return await repository.getAllProductos();
};

/**
 * Obtener un producto por ID
 */
export const getProductoById = async (id) => {
  const producto = await repository.getProductoById(Number(id));

  if (!producto || !producto.disponible) {
    throw new Error("Producto no encontrado");
  }

  return producto;
};
/**
 * Obtener productor por categoria
 */
export const getProductosByCategoria = async (categoria_id) => {
  const id = Number(categoria_id);

  if (isNaN(id)) {
    throw new Error("El ID de la categoría no es válido");
  }
  const categoria = await repository.getCategoriaById(id);

  if (!categoria || !categoria.activa) {
    throw new Error("La categoría no existe o está inactiva");
  }
  const productos = await repository.getProductosByCategoria(categoria_id);
  return productos;
};
export const createProducto = async (data, file) => {
  try {
    const { categoria_id, nombre, descripcion, precio } = data;

    // Validar categoría
    const categoriaId = Number(categoria_id);
    if (!categoriaId) {
      throw new Error("El campo 'categoria_id' es obligatorio");
    }

    const categoria = await repository.getCategoriaById(categoriaId);
    if (!categoria || !categoria.activa) {
      throw new Error("La categoría no existe o está inactiva");
    }

    // Validar duplicidad de nombre
    const existingProducto = await repository.existsProductoByNombre(nombre);
    if (existingProducto) {
      throw new Error("Ya existe un producto con ese nombre");
    }

    // Crear producto
    return await repository.createProducto({
      categoria_id: categoriaId,
      nombre,
      descripcion,
      precio: Number(precio),
      imagen_url: file?.path || null,
      imagen_public_id: file?.filename || null,
    });
  } catch (error) {
    // 🧹 Eliminar la imagen subida en caso de error
    if (file?.filename) {
      try {
        await cloudinary.uploader.destroy(file.filename);
      } catch (cloudinaryError) {
        console.error(
          "Error eliminando la imagen de Cloudinary:",
          cloudinaryError,
        );
      }
    }
    throw error;
  }
};

/**
 * Actualizar un producto existente
 */
export const updateProducto = async (id, data, file) => {
  let nuevaImagenPublicId = null;

  try {
    const producto = await repository.getProductoById(Number(id));

    if (!producto || !producto.disponible) {
      throw new Error("Producto no encontrado");
    }

    // 🔹 Validar nueva categoría si se proporciona
    let categoriaId = producto.categoria_id;

    if (data.categoria_id !== undefined) {
      const categoriaIdNum = Number(data.categoria_id);

      if (isNaN(categoriaIdNum)) {
        throw new Error("El 'categoria_id' debe ser un número válido");
      }

      const categoria = await repository.getCategoriaById(categoriaIdNum);

      if (!categoria || !categoria.activa) {
        throw new Error("La categoría no existe o está inactiva");
      }

      categoriaId = categoriaIdNum;
    }

    // 🔹 Validar duplicidad de nombre si se modifica
    if (
      data.nombre &&
      data.nombre.toLowerCase() !== producto.nombre.toLowerCase()
    ) {
      const existingProducto = await repository.existsProductoByNombre(
        data.nombre,
      );

      if (existingProducto && existingProducto.id !== producto.id) {
        throw new Error("Ya existe un producto con ese nombre");
      }
    }

    // 🔹 Manejo de la nueva imagen
    let imagenData = {};
    if (file) {
      nuevaImagenPublicId = file.filename; // Guardamos referencia para posible rollback

      imagenData = {
        imagen_url: file.path,
        imagen_public_id: file.filename,
      };
    }

    // 🔹 Preparar datos para la actualización
    const updatedData = {
      categoria_id: categoriaId,
      nombre: data.nombre ?? producto.nombre,
      descripcion: data.descripcion ?? producto.descripcion,
      precio: data.precio !== undefined ? Number(data.precio) : producto.precio,
      ...imagenData,
    };

    // 🔹 Actualizar el producto en la base de datos
    const updatedProducto = await repository.updateProducto(
      Number(id),
      updatedData,
    );

    // 🔹 Eliminar la imagen anterior solo después de una actualización exitosa
    if (file && producto.imagen_public_id) {
      try {
        await cloudinary.uploader.destroy(producto.imagen_public_id);
      } catch (error) {
        console.error(
          "Error eliminando la imagen anterior de Cloudinary:",
          error,
        );
      }
    }

    return updatedProducto;
  } catch (error) {
    // 🔹 Si ocurre un error y se había subido una nueva imagen, eliminarla
    if (file && nuevaImagenPublicId) {
      try {
        await cloudinary.uploader.destroy(nuevaImagenPublicId);
      } catch (cleanupError) {
        console.error(
          "Error eliminando la nueva imagen tras fallo en la actualización:",
          cleanupError,
        );
      }
    }

    throw error;
  }
};

/**
 * Eliminación lógica de un producto
 */
export const deleteProducto = async (id) => {
  const producto = await repository.getProductoById(Number(id));

  if (!producto || !producto.disponible) {
    throw new Error("Producto no encontrado");
  }

  // Eliminar imagen en Cloudinary si existe
  if (producto.imagen_public_id) {
    await cloudinary.uploader.destroy(producto.imagen_public_id);
  }

  return await repository.deleteProducto(Number(id));
};
