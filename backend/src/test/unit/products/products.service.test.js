import * as repository from '../../../modules/products/products.repository.js';
import { v2 as cloudinary } from 'cloudinary';

import {
  getProductoById,
  getProductosByCategoria,
  createProducto,
  updateProducto,
  deleteProducto
} from '../../../modules/products/products.service.js';

// 🔧 mocks
jest.mock('../../../modules/products/products.repository.js', () => ({
  getAllProductos: jest.fn(),
  getProductoById: jest.fn(),
  getCategoriaById: jest.fn(),
  getProductosByCategoria: jest.fn(),
  existsProductoByNombre: jest.fn(),
  createProducto: jest.fn(),
  updateProducto: jest.fn(),
  deleteProducto: jest.fn(),
}));

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      destroy: jest.fn(),
    },
  },
}));

describe('productos.service', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductoById', () => {

    test('devuelve producto válido', async () => {
      repository.getProductoById.mockResolvedValue({
        id: 1,
        disponible: true
      });

      const result = await getProductoById(1);

      expect(result.id).toBe(1);
    });

    test('error si no existe o no disponible', async () => {
      repository.getProductoById.mockResolvedValue(null);

      await expect(getProductoById(1))
        .rejects
        .toThrow('Producto no encontrado');
    });

  });


  describe('getProductosByCategoria', () => {

    test('devuelve productos', async () => {
      repository.getCategoriaById.mockResolvedValue({ activa: true });

      repository.getProductosByCategoria.mockResolvedValue([
        { id: 1 }
      ]);

      const result = await getProductosByCategoria(1);

      expect(result).toHaveLength(1);
    });

    test('error si id inválido', async () => {
      await expect(getProductosByCategoria('abc'))
        .rejects
        .toThrow();
    });

    test('error si categoría inactiva', async () => {
      repository.getCategoriaById.mockResolvedValue({ activa: false });

      await expect(getProductosByCategoria(1))
        .rejects
        .toThrow();
    });

  });

  describe('createProducto', () => {

    test('crea producto correctamente', async () => {
      repository.getCategoriaById.mockResolvedValue({ activa: true });

      repository.existsProductoByNombre.mockResolvedValue(null);

      repository.createProducto.mockResolvedValue({ id: 1 });

      const result = await createProducto(
        {
          categoria_id: 1,
          nombre: 'Pizza',
          precio: 10
        },
        null
      );

      expect(result.id).toBe(1);
    });

    test('error si nombre duplicado', async () => {
      repository.getCategoriaById.mockResolvedValue({ activa: true });

      repository.existsProductoByNombre.mockResolvedValue({ id: 1 });

      await expect(
        createProducto({
          categoria_id: 1,
          nombre: 'Pizza'
        })
      ).rejects.toThrow('Ya existe un producto con ese nombre');
    });

    test('elimina imagen si falla', async () => {
      repository.getCategoriaById.mockResolvedValue({ activa: false });

      await expect(
        createProducto(
          { categoria_id: 1, nombre: 'Pizza' },
          { filename: 'img123' }
        )
      ).rejects.toThrow();

      expect(cloudinary.uploader.destroy)
        .toHaveBeenCalledWith('img123');
    });

  });

  describe('updateProducto', () => {

    test('actualiza producto correctamente', async () => {
      repository.getProductoById.mockResolvedValue({
        id: 1,
        disponible: true,
        nombre: 'Pizza',
        categoria_id: 1
      });

      repository.updateProducto.mockResolvedValue({
        id: 1,
        nombre: 'Pizza nueva'
      });

      const result = await updateProducto(1, {
        nombre: 'Pizza nueva'
      });

      expect(result.nombre).toBe('Pizza nueva');
    });

    test('error si producto no existe', async () => {
      repository.getProductoById.mockResolvedValue(null);

      await expect(updateProducto(1, {}))
        .rejects
        .toThrow('Producto no encontrado');
    });

  });


  describe('deleteProducto', () => {

    test('elimina producto correctamente', async () => {
      repository.getProductoById.mockResolvedValue({
        id: 1,
        disponible: true,
        imagen_public_id: 'img123'
      });

      repository.deleteProducto.mockResolvedValue(true);

      const result = await deleteProducto(1);

      expect(cloudinary.uploader.destroy)
        .toHaveBeenCalledWith('img123');

      expect(result).toBe(true);
    });

    test('error si no existe', async () => {
      repository.getProductoById.mockResolvedValue(null);

      await expect(deleteProducto(1))
        .rejects
        .toThrow('Producto no encontrado');
    });

  });

});