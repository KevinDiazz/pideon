import request from 'supertest';
import app from '../../app.js';

// 🔧 mock del controller
jest.mock('../../modules/orders/orders.controller.js', () => ({
  crearPedido: jest.fn((req, res) => res.status(201).json({ ok: true })),
  obtenerMisPedidos: jest.fn((req, res) => res.json([])),
  obtenerPedidosPendientes: jest.fn((req, res) => res.json([])),
  obtenerPedidosListos: jest.fn((req, res) => res.json([])),
  obtenerMisRepartos: jest.fn((req, res) => res.json([])),
  obtenerTodos: jest.fn((req, res) => res.json([])),
  obtenerPorId: jest.fn((req, res) => res.json({ id: 1 })),
  descargarFactura: jest.fn((req, res) => res.status(200).send('PDF')),
  actualizarEstado: jest.fn((req, res) => res.json({ estado: 'ok' })),
  asignarRepartidor: jest.fn((req, res) => res.json({ asignado: true })),
}));

// 🔧 mock dinámico de auth
let mockRole = 'cliente';

jest.mock('../../middlewares/authenticate.middleware.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, rol: mockRole };
    next();
  },
}));

jest.mock('../../middlewares/authorize.middleware.js', () => ({
  authorize: (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  },
}));

describe('Orders Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });


  test('POST /api/orders → cliente crea pedido', async () => {
    mockRole = 'cliente';

    const res = await request(app)
      .post('/api/orders')
      .send({ lineas: [{ producto_id: 1, cantidad: 1 }] });

    expect(res.statusCode).toBe(201);
  });

  test('POST /api/orders → 403 si no es cliente', async () => {
    mockRole = 'repartidor';

    const res = await request(app)
      .post('/api/orders')
      .send({});

    expect(res.statusCode).toBe(403);
  });


  test('GET /api/orders/mis-pedidos → cliente OK', async () => {
    mockRole = 'cliente';

    const res = await request(app).get('/api/orders/mis-pedidos');

    expect(res.statusCode).toBe(200);
  });


  test('GET /api/orders/pendientes → cocina OK', async () => {
    mockRole = 'cocina';

    const res = await request(app).get('/api/orders/pendientes');

    expect(res.statusCode).toBe(200);
  });

  test('GET /api/orders/pendientes → cliente NO', async () => {
    mockRole = 'cliente';

    const res = await request(app).get('/api/orders/pendientes');

    expect(res.statusCode).toBe(403);
  });


  test('GET /api/orders/listos → repartidor OK', async () => {
    mockRole = 'repartidor';

    const res = await request(app).get('/api/orders/listos');

    expect(res.statusCode).toBe(200);
  });


  test('GET /api/orders/:id → autorizado', async () => {
    mockRole = 'admin';

    const res = await request(app).get('/api/orders/1');

    expect(res.statusCode).toBe(200);
  });

  test('GET /api/orders/:id/factura → cliente OK', async () => {
    mockRole = 'cliente';

    const res = await request(app).get('/api/orders/1/factura');

    expect(res.statusCode).toBe(200);
  });


  test('PATCH /api/orders/:id/estado → cocina OK', async () => {
    mockRole = 'cocina';

    const res = await request(app)
      .patch('/api/orders/1/estado')
      .send({ estado: 'listo' });

    expect(res.statusCode).toBe(200);
  });

  test('PATCH /api/orders/:id/estado → cliente NO', async () => {
    mockRole = 'cliente';

    const res = await request(app)
      .patch('/api/orders/1/estado')
      .send({ estado: 'listo' });

    expect(res.statusCode).toBe(403);
  });

  test('PATCH /api/orders/:id/asignar-repartidor → repartidor OK', async () => {
    mockRole = 'repartidor';

    const res = await request(app)
      .patch('/api/orders/1/asignar-repartidor');

    expect(res.statusCode).toBe(200);
  });

});