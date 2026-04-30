import request from 'supertest';
import app from '../../app.js';

// mocks
jest.mock('../../modules/auth/auth.service.js', () => ({
  register: jest.fn(),
  login: jest.fn(),
  getUserById: jest.fn(),
}));

jest.mock('../../middlewares/authenticate.middleware.js', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1, rol: 'cliente' };
    next();
  },
}));

import * as authService from '../../modules/auth/auth.service.js';

describe('Auth Routes', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/auth/register', async () => {
    authService.register.mockResolvedValue({
      id: 1,
      nombre: 'Kevin',
      apellidos: 'Diaz',
      email: 'test@test.com',
      rol: 'cliente'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Kevin',
        apellidos: 'Diaz',
        email: 'test@test.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('test@test.com');
  });

  test('POST /api/auth/login', async () => {
    authService.login.mockResolvedValue({
      token: 'fake-token',
      user: { id: 1 }
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe('fake-token');
  });

  test('GET /api/auth/me', async () => {
    authService.getUserById.mockResolvedValue({
      id: 1,
      email: 'test@test.com'
    });

    const res = await request(app)
      .get('/api/auth/me');

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });

});