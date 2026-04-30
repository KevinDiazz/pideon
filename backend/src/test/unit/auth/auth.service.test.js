import * as userRepository from '../../../modules/auth/auth.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  register,
  login,
  getUserById
} from '../../../modules/auth/auth.service.js';

// 🔧 mocks
jest.mock('../../../modules/auth/auth.repository.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('auth.service', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {

    test('crea usuario correctamente', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      bcrypt.hash.mockResolvedValue('hashed123');

      userRepository.create.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        nombre: 'Kevin'
      });

      const result = await register({
        email: 'test@test.com',
        password: '1234',
        nombre: 'Kevin'
      });

      expect(userRepository.findByEmail)
        .toHaveBeenCalledWith('test@test.com');

      expect(bcrypt.hash)
        .toHaveBeenCalledWith('1234', 10);

      expect(userRepository.create)
        .toHaveBeenCalled();

      expect(result.id).toBe(1);
    });

    test('lanza error si el usuario ya existe', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 1 });

      await expect(
        register({ email: 'test@test.com', password: '1234' })
      ).rejects.toMatchObject({
        message: 'El usuario ya existe',
        status: 400
      });
    });

  });

  describe('login', () => {

    test('login correcto devuelve token y usuario', async () => {
      userRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password_hash: 'hashed',
        rol: 'cliente'
      });

      bcrypt.compare.mockResolvedValue(true);

      jwt.sign.mockReturnValue('fake-token');

      const result = await login({
        email: 'test@test.com',
        password: '1234'
      });

      expect(bcrypt.compare).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();

      expect(result.token).toBe('fake-token');
      expect(result.user.email).toBe('test@test.com');

      // 🔒 importante
      expect(result.user.password_hash).toBeUndefined();
    });

    test('error si usuario no existe', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        login({ email: 'test@test.com', password: '1234' })
      ).rejects.toMatchObject({
        status: 401
      });
    });

    test('error si password incorrecta', async () => {
      userRepository.findByEmail.mockResolvedValue({
        password_hash: 'hashed'
      });

      bcrypt.compare.mockResolvedValue(false);

      await expect(
        login({ email: 'test@test.com', password: 'wrong' })
      ).rejects.toMatchObject({
        status: 401
      });
    });

  });


  describe('getUserById', () => {

    test('devuelve usuario activo', async () => {
      userRepository.findById.mockResolvedValue({
        id: 1,
        activo: true
      });

      const result = await getUserById(1);

      expect(result.id).toBe(1);
    });

    test('error si no existe', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(getUserById(1))
        .rejects
        .toMatchObject({ status: 404 });
    });

    test('error si está inactivo', async () => {
      userRepository.findById.mockResolvedValue({
        activo: false
      });

      await expect(getUserById(1))
        .rejects
        .toMatchObject({ status: 403 });
    });

  });

});