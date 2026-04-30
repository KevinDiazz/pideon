import * as pedidosRepository from '../../../modules/orders/orders.repository.js';
import { getProductoById } from '../../../modules/products/products.repository.js';

import {
  crearPedido,
  obtenerPorId,
  actualizarEstado,
  asignarRepartidor,
  cancelarPedido
} from '../../../modules/orders/orders.service.js';

// mocks
jest.mock('../../../modules/orders/orders.repository.js');
jest.mock('../../../modules/products/products.repository.js');

describe('pedidos.service', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearPedido', () => {

    test('crea pedido correctamente', async () => {
      getProductoById.mockResolvedValue({
        id: 1,
        precio: 10,
        disponible: true
      });

      pedidosRepository.createPedido.mockResolvedValue({ id: 1 });

      const result = await crearPedido(1, {
        lineas: [{ producto_id: 1, cantidad: 2 }],
      });

      expect(result.id).toBe(1);
      expect(pedidosRepository.createPedido).toHaveBeenCalled();
    });

    test('error si no hay líneas', async () => {
      await expect(
        crearPedido(1, { lineas: [] })
      ).rejects.toMatchObject({
        statusCode: 400
      });
    });

    test('error si producto no disponible', async () => {
      getProductoById.mockResolvedValue({
        disponible: false
      });

      await expect(
        crearPedido(1, {
          lineas: [{ producto_id: 1, cantidad: 1 }]
        })
      ).rejects.toMatchObject({
        statusCode: 400
      });
    });

  });


  describe('obtenerPorId', () => {

    test('devuelve pedido si es del usuario', async () => {
      pedidosRepository.findById.mockResolvedValue({
        id: 1,
        usuario_id: 1
      });

      const result = await obtenerPorId(1, {
        id: 1,
        rol: 'cliente'
      });

      expect(result.id).toBe(1);
    });

    test('error si no existe', async () => {
      pedidosRepository.findById.mockResolvedValue(null);

      await expect(
        obtenerPorId(1, { rol: 'admin' })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test('error si cliente accede a otro pedido', async () => {
      pedidosRepository.findById.mockResolvedValue({
        usuario_id: 2
      });

      await expect(
        obtenerPorId(1, { id: 1, rol: 'cliente' })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

  });


  describe('actualizarEstado', () => {

    test('actualiza estado correctamente', async () => {
      pedidosRepository.findById.mockResolvedValue({
        estado: 'pendiente',
        tipo_entrega: 'domicilio'
      });

      pedidosRepository.updateEstado.mockResolvedValue({
        estado: 'preparacion'
      });

      const result = await actualizarEstado(
        1,
        'preparacion',
        { rol: 'cocina' }
      );

      expect(result.estado).toBe('preparacion');
    });

    test('error si estado inválido', async () => {
      await expect(
        actualizarEstado(1, 'random', { rol: 'admin' })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test('error si transición no válida', async () => {
      pedidosRepository.findById.mockResolvedValue({
        estado: 'pendiente',
        tipo_entrega: 'domicilio'
      });

      await expect(
        actualizarEstado(1, 'entregado', { rol: 'admin' })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test('error por permisos de rol', async () => {
      pedidosRepository.findById.mockResolvedValue({
        estado: 'pendiente',
        tipo_entrega: 'domicilio'
      });

      await expect(
        actualizarEstado(1, 'preparacion', { rol: 'repartidor' })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

  });


  describe('asignarRepartidor', () => {

    test('asigna correctamente', async () => {
      pedidosRepository.findById.mockResolvedValue({
        estado: 'listo',
        tipo_entrega: 'domicilio'
      });

      pedidosRepository.findAsignacionByPedidoId.mockResolvedValue(null);

      pedidosRepository.asignarRepartidor.mockResolvedValue(true);

      const result = await asignarRepartidor(1, 10);

      expect(result).toBe(true);
    });
test('error si pedido no existe', async () => {
  pedidosRepository.findById.mockResolvedValue(null);

  await expect(
    actualizarEstado(1, 'preparacion', { rol: 'admin' })
  ).rejects.toMatchObject({ statusCode: 404 });
});
    test('error si ya está asignado', async () => {
      pedidosRepository.findById.mockResolvedValue({
        estado: 'listo',
        tipo_entrega: 'domicilio'
      });

      pedidosRepository.findAsignacionByPedidoId.mockResolvedValue({});

      await expect(
        asignarRepartidor(1, 10)
      ).rejects.toMatchObject({ statusCode: 400 });
    });

  });

});