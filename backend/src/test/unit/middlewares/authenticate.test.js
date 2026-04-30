import { authenticate } from '../../../middlewares/authenticate.middleware';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('authenticate middleware', () => {

  test('error si no hay token', () => {
    const req = { headers: {} };
    const next = jest.fn();

    authenticate(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401 })
    );
  });

  test('error si token inválido', () => {
    const req = {
      headers: { authorization: 'Bearer fake' }
    };
    const next = jest.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error();
    });

    authenticate(req, {}, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ status: 401 })
    );
  });

  test('pasa si token válido', () => {
    const req = {
      headers: { authorization: 'Bearer valid' }
    };
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: 1, rol: 'admin' });

    authenticate(req, {}, next);

    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

});