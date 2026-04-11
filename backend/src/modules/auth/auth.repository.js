import prisma from '../../config/prisma.js';

export const findByEmail = (email) => {
  return prisma.usuario.findUnique({ where: { email } });
};

export const create = (data) => {
  return prisma.usuario.create({ data });
};