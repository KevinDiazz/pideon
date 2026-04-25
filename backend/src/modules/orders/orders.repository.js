import prisma from "../../../prisma/config/prisma.js";

//Crear un pedido con sus líneas y pago asociado.
export const createPedido = async (data) => {
  return prisma.$transaction(async (tx) => {
    const pedido = await tx.pedido.create({
      data: {
        usuario_id: data.usuario_id,
        cupon_id: data.cupon_id,
        estado: data.estado || "pendiente",
        tipo_entrega: data.tipo_entrega,
        telefono: data.telefono,
        entrega_calle: data.entrega_calle,
        entrega_numero: data.entrega_numero,
        entrega_piso: data.entrega_piso,
        entrega_ciudad: data.entrega_ciudad,
        entrega_cp: data.entrega_cp,
        total: data.total,
        descuento_aplicado: data.descuento_aplicado || 0,
        notas: data.notas,
        lineas: {
          create: data.lineas, // [{ producto_id, cantidad, precio_unitario, notas_linea }]
        },
        pago: data.pago
          ? {
              create: {
                metodo: data.pago.metodo,
                estado: data.pago.estado || "pendiente",
                importe: data.pago.importe,
                referencia_externa: data.pago.referencia_externa,
                fecha_pago: data.pago.fecha_pago,
              },
            }
          : undefined,
      },
      include: {
        usuario: {
          select: { id: true, nombre: true, apellidos: true, email: true },
        },
        lineas: {
          include: {
            producto: {
              select: { id: true, nombre: true, precio: true },
            },
          },
        },
        pago: true,
      },
    });

    return pedido;
  });
};

// Obtener todos los pedidos
export const findAll = async () => {
  return prisma.pedido.findMany({
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          email: true,
        },
      },
      lineas: {
        include: {
          producto: true,
        },
      },
      pago: true,
      asignacion_reparto: {
        include: {
          repartidor: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

//Obtener pedidos con estado PENDIENTE
export const findPedidosPendientes = async () => {
  return prisma.pedido.findMany({
    where: {
      estado: "pendiente",
    },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
        },
      },
      lineas: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              precio: true,
            },
          },
        },
      },
      pago: {
        select: {
          metodo: true,
          estado: true,
        },
      },
    },
    orderBy: {
      created_at: "asc", // Los más antiguos primero
    },
  });
};

//Obtener pedidos con estado LISTO
export const findPedidosListos = async (soloNoAsignados = false) => {
  return prisma.pedido.findMany({
    where: {
      estado: "listo",
      ...(soloNoAsignados && {
        asignacion_reparto: {
          none: {},
        },
      }),
    },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
        },
      },
      lineas: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              precio: true,
            },
          },
        },
      },
      pago: true,
      asignacion_reparto: {
        include: {
          repartidor: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
        },
      },
    },
    orderBy: {
      created_at: "asc",
    },
  });
};

//Obtener pedidos de un usuario específico
export const findByUsuarioId = async (usuarioId) => {
  return prisma.pedido.findMany({
    where: { usuario_id: usuarioId },
    include: {
      lineas: {
        include: {
          producto: true,
        },
      },
      pago: true,
      asignacion_reparto: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

//Obtener pedidos asignados a un repartidor (cualquier estado, p.ej. reparto o entregado)
export const findByRepartidorId = async (repartidorId) => {
  return prisma.pedido.findMany({
    where: {
      asignacion_reparto: {
        some: { repartidor_id: repartidorId },
      },
    },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
        },
      },
      lineas: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              precio: true,
            },
          },
        },
      },
      pago: true,
      asignacion_reparto: {
        include: {
          repartidor: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
        },
      },
    },
    orderBy: {
      updated_at: "desc",
    },
  });
};

//Obtener un pedido por su ID
export const findById = async (pedidoId) => {
  return prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      usuario: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          email: true,
        },
      },
      lineas: {
        include: {
          producto: true,
        },
      },
      pago: true,
      asignacion_reparto: {
        include: {
          repartidor: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
        },
      },
    },
  });
};

//Actualizar el estado de un pedido
export const updateEstado = async (pedidoId, estado) => {
  return prisma.pedido.update({
    where: { id: pedidoId },
    data: { estado },
  });
};

//Crear la asignación de un repartidor y actualizar el estado a EN_REPARTO
export const asignarRepartidor = async (pedidoId, repartidorId) => {
  return prisma.$transaction(async (tx) => {
    const asignacion = await tx.asignacionReparto.create({
      data: {
        pedido_id: pedidoId,
        repartidor_id: repartidorId,
      },
      include: {
        repartidor: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
          },
        },
      },
    });

    const pedidoActualizado = await tx.pedido.update({
      where: { id: pedidoId },
      data: { estado: "reparto" },
    });

    return {
      asignacion,
      pedido: pedidoActualizado,
    };
  });
};

//Verificar si un pedido ya tiene asignación de repartidor
export const findAsignacionByPedidoId = async (pedidoId) => {
  return prisma.asignacionReparto.findFirst({
    where: { pedido_id: pedidoId },
  });
};
/*
//Cancelación lógica del pedido
export const cancelarPedido = async (pedidoId) => {
  return prisma.pedido.update({
    where: { id: pedidoId },
    data: { estado: "cancelado" },
  });
};
*/
