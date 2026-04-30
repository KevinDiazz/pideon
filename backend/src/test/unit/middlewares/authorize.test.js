import { authorize } from '../../../middlewares/authorize.middleware.js';

describe('authorize middleware', () => {

  test('bloquea si no tiene rol', () => {
    const req = { user: { rol: 'cliente' } };

    const next = jest.fn();

    const middleware = authorize('admin');

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 403 })
    );
  });

  test('permite si tiene rol', () => {
    const req = { user: { rol: 'admin' } };

    const next = jest.fn();

    const middleware = authorize('admin');

    middleware(req, {}, next);

    expect(next).toHaveBeenCalled();
  });

});