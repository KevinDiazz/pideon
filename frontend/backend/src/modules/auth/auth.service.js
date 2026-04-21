import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userRepository from "../auth/auth.repository.js";

export const register = async (data) => {
  const { password, ...rest } = data;

  const existingUser = await userRepository.findByEmail(rest.email);
  if (existingUser) {
    throw { status: 400, message: "El usuario ya existe" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.create({
    ...rest,
    password_hash: hashedPassword,
  });
  return user;
};

export const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw { status: 401, message: "Credenciales inválidas" };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw { status: 401, message: "Credenciales inválidas" };
  }
  const { password_hash, ...userWithoutPassword } = user;
  const token = jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  return {
    token,
    user: userWithoutPassword,
  };
};
export const getUserById = async (id) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw { status: 404, message: "Usuario no encontrado" };
  }

  if (!user.activo) {
    throw { status: 403, message: "Usuario inactivo" };
  }

  return user;
};
