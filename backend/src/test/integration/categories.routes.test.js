import request from 'supertest';
import app from '../../app.js';

// 🔧 Mock del service (no DB)
jest.mock('../../modules/categories/categories.service.js', () => ({
  getCategorias: jest.fn(),
  getCategoriaById: jest.fn(),
  createCategoria: jest.fn(),
  updateCategoria: jest.fn(),
  deleteCategoria: jest.fn(),
}));

// 🔧 Mock de auth
jest.mock('../../middlewares/authenticate.middleware.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, rol: 'admin' }; // por defecto admin
    next();
  },
}));

// 🔧 Mock de authorize
jest.mock('../../middlewares/authorize.middleware.js', () => ({
  authorize: () => (req, res, next) => next(),
}));

import * as categoriaService from '../../modules/categories/categories.service.js';

describe('Categories Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });


  test('GET /api/categories → devuelve categorías', async () => {
    categoriaService.getCategorias.mockResolvedValue([
      { id: 1, nombre: 'Bebidas' }
    ]);

    const res = await request(app).get('/api/categories');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
  });


  test('GET /api/categories/:id → devuelve categoría', async () => {
    categoriaService.getCategoriaById.mockResolvedValue({
      id: 1,
      nombre: 'Bebidas'
    });

    const res = await request(app).get('/api/categories/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });

  test('POST /api/categories → crea categoría (admin)', async () => {
    categoriaService.createCategoria.mockResolvedValue({
      id: 1,
      nombre: 'Nueva'
    });

    const res = await request(app)
      .post('/api/categories')
      .send({ nombre: 'Nueva' });

    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe('Nueva');
  });


  test('PUT /api/categories/:id → actualiza categoría', async () => {
    categoriaService.updateCategoria.mockResolvedValue({
      id: 1,
      nombre: 'Actualizada'
    });

    const res = await request(app)
      .put('/api/categories/1')
      .send({ nombre: 'Actualizada' });

    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe('Actualizada');
  });


  test('DELETE /api/categories/:id → elimina categoría', async () => {
    categoriaService.deleteCategoria.mockResolvedValue(true);

    const res = await request(app)
      .delete('/api/categories/1');

    expect(res.statusCode).toBe(200);
  });

});