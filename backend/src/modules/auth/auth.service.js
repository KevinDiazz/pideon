import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepository from '../users/user.repository.js';

export const register = async (data) => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw { status: 400, message: 'El usuario ya existe' };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await userRepository.create({
    ...data,
    password_hash: hashedPassword,
  });

  return user;
};

export const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw { status: 401, message: 'Credenciales inválidas' };
  }

  const token = jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return { token };
};