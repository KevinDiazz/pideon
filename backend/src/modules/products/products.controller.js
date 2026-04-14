// src/modules/productos/productos.controller.js
import * as service from "./products.service.js";

export const getAllProductos = async (req, res) => {
  try {
    const productos = await service.getAllProductos();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductoById = async (req, res) => {
  try {
    const producto = await service.getProductoById(req.params.id);
    res.json(producto);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
export const getProductosByCategoria = async (req, res) => {
  try {
    const producto = await service.getProductosByCategoria(
      req.params.categoria_id,
    );
    res.json(producto);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createProducto = async (req, res) => {
  try {
      console.log("Archivo recibido:", req.file);
          console.log("objeto recibido:", req.body);
    const producto = await service.createProducto(req.body, req.file);
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProducto = async (req, res) => {
  try {
    const producto = await service.updateProducto(
      req.params.id,
      req.body,
      req.file,
    );
    res.json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProducto = async (req, res) => {
  try {
    await service.deleteProducto(req.params.id);
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
