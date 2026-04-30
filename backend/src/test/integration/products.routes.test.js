import request from 'supertest';
import app from '../../app.js';

// 🔧 Mock controller (no lógica real)
jest.mock('../../modules/products/products.controller.js', () => ({
  getAllProductos: jest.fn((req, res) => res.json([{ id: 1 }])),
  getProductoById: jest.fn((req, res) => res.json({ id: 1 })),
  getProductosByCategoria: jest.fn((req, res) => res.json([{ id: 1 }])),
  createProducto: jest.fn((req, res) => res.status(201).json({ id: 1 })),
  updateProducto: jest.fn((req, res) => res.json({ id: 1 })),
  deleteProducto: jest.fn((req, res) => res.status(200).json({ ok: true })),
}));

// 🔧 Mock auth (dinámico por rol)
let mockRole = 'admin';

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

// 🔧 Mock upload (evita multer real)
jest.mock('../../middlewares/upload.js', () => ({
  __esModule: true,
  default: {
    single: () => (req, res, next) => {
      // simulamos archivo si quieres
      req.file = { filename: 'fake-img', path: '/fake.jpg' };
      next();
    },
  },
}));

describe('Products Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });


  test('GET /api/productos → lista productos', async () => {
    const res = await request(app).get('/api/products');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('GET /api/products/:id → producto', async () => {
    const res = await request(app).get('/api/products/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('GET /api/products/categories/:id → productos por categoría', async () => {
    const res = await request(app).get('/api/products/categories/1');

    expect(res.statusCode).toBe(200);
  });


  test('POST /api/products → admin OK', async () => {
    mockRole = 'admin';

    const res = await request(app)
      .post('/api/products')
      .field('nombre', 'Pizza')
      .field('precio', 10);

    expect(res.statusCode).toBe(201);
  });

  test('POST /api/products → 403 si no es admin', async () => {
    mockRole = 'cliente';

    const res = await request(app)
      .post('/api/products')
      .field('nombre', 'Pizza');

    expect(res.statusCode).toBe(403);
  });


  test('PUT /api/products/:id → admin OK', async () => {
    mockRole = 'admin';

    const res = await request(app)
      .put('/api/products/1')
      .field('nombre', 'Nueva Pizza');

    expect(res.statusCode).toBe(200);
  });

  test('PUT /api/products/:id → 403 si no es admin', async () => {
    mockRole = 'cliente';

    const res = await request(app)
      .put('/api/products/1')
      .field('nombre', 'Nueva Pizza');

    expect(res.statusCode).toBe(403);
  });


  test('DELETE /api/products/:id → admin OK', async () => {
    mockRole = 'admin';

    const res = await request(app)
      .delete('/api/products/1');

    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/products/:id → 403 si no es admin', async () => {
    mockRole = 'cliente';

    const res = await request(app)
      .delete('/api/products/1');

    expect(res.statusCode).toBe(403);
  });

});