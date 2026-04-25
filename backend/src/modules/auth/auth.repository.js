import prisma from "../../../prisma/config/prisma.js";

export const findByEmail = (email) => {
  return prisma.usuario.findUnique({ where: { email } });
};

export const create = (data) => {
  return prisma.usuario.create({ data });
};
export const findById = (id) => {
  return prisma.usuario.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      email: true,
      rol: true,
      activo: true,
      created_at: true,
    },
  });
};
