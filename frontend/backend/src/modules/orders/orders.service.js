// src/modules/pedidos/pedidos.service.js
import * as pedidosRepository from "./orders.repository.js";
import { getProductoById } from "../products/products.repository.js";

//Crear un nuevo pedido
export const crearPedido = async (usuarioId, data) => {
  const {
    lineas,
    tipo_entrega,
    telefono,
    entrega_calle,
    entrega_numero,
    entrega_piso,
    entrega_ciudad,
    entrega_cp,
    cupon_id,
    metodo_pago,
    notas,
  } = data;

  if (!lineas || lineas.length === 0) {
    const error = new Error("El pedido debe contener al menos una línea");
    error.statusCode = 400;
    throw error;
  }

  let total = 0;

  //Validar productos y calcular total
  const lineasProcesadas = await Promise.all(
    lineas.map(async (linea) => {
      const producto = await getProductoById(linea.producto_id);

      if (!producto || !producto.disponible) {
        const error = new Error(`Producto no disponible: ${linea.producto_id}`);
        error.statusCode = 400;
        throw error;
      }

      const precio = Number(producto.precio);
      const subtotal = precio * linea.cantidad;
      total += subtotal;

      return {
        producto_id: linea.producto_id,
        cantidad: linea.cantidad,
        precio_unitario: precio,
        notas_linea: linea.notas_linea,
      };
    }),
  );

  // Aplicar cupón si existe
  let descuento = 0;
  if (cupon_id) {
    const cupon = await prisma.cupon.findUnique({
      where: { id: cupon_id },
    });

    if (!cupon || !cupon.activo) {
      const error = new Error("Cupón no válido o inactivo");
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    if (now < cupon.fecha_inicio || now > cupon.fecha_fin) {
      const error = new Error("El cupón no está vigente");
      error.statusCode = 400;
      throw error;
    }

    if (cupon.usos_maximos && cupon.usos_actuales >= cupon.usos_maximos) {
      const error = new Error("El cupón ha alcanzado su límite de usos");
      error.statusCode = 400;
      throw error;
    }

    if (cupon.tipo_descuento === "porcentaje") {
      descuento = (total * Number(cupon.valor)) / 100;
    } else {
      descuento = Number(cupon.valor);
    }

    // Evitar totales negativos
    descuento = Math.min(descuento, total);

    // Incrementar usos del cupón
    await prisma.cupon.update({
      where: { id: cupon_id },
      data: { usos_actuales: { increment: 1 } },
    });
  }

  const totalFinal = Number((total - descuento).toFixed(2));

  // Preparar datos para el repository
  const pedidoData = {
    usuario_id: usuarioId,
    cupon_id,
    tipo_entrega,
    telefono,
    entrega_calle,
    entrega_numero,
    entrega_piso,
    entrega_ciudad,
    entrega_cp,
    total: totalFinal,
    descuento_aplicado: descuento,
    notas,
    lineas: lineasProcesadas,
    pago: metodo_pago
      ? {
          metodo: metodo_pago,
          importe: totalFinal,
        }
      : undefined,
  };

  return await pedidosRepository.createPedido(pedidoData);
};

//Obtener todos los pedidos
export const obtenerTodos = async () => {
  return await pedidosRepository.findAll();
};

//Obtener pedidos con estado PENDIENTE
export const obtenerPedidosPendientes = async () => {
  try {
    const pedidos = await pedidosRepository.findPedidosPendientes();

    // Posible punto de extensión para lógica adicional
    // Ejemplo: formatear datos o aplicar filtros extra

    return pedidos;
  } catch (error) {
    // Propagar el error para que lo maneje el middleware global
    error.statusCode = error.statusCode || 500;
    throw error;
  }
};

//Obtener pedidos con estado LISTO
export const obtenerPedidosListos = async (soloNoAsignados = false) => {
  return await pedidosRepository.findPedidosListos(soloNoAsignados);
};

//Obtener pedidos del usuario autenticado
export const obtenerPorUsuario = async (usuarioId) => {
  return await pedidosRepository.findByUsuarioId(usuarioId);
};

//Obtener un pedido por ID con validación de acceso
export const obtenerPorId = async (pedidoId, usuario) => {
  const pedido = await pedidosRepository.findById(pedidoId);

  if (!pedido) {
    const error = new Error("Pedido no encontrado");
    error.statusCode = 404;
    throw error;
  }

  //Si es cliente, solo puede ver sus propios pedidos
  if (usuario.rol === "cliente" && pedido.usuario_id !== usuario.id) {
    const error = new Error("No autorizado para acceder a este pedido");
    error.statusCode = 403;
    throw error;
  }

  return pedido;
};

//estados del pedido
const estadosPermitidos = [
  "pendiente",
  "preparacion",
  "listo",
  "reparto",
  "entregado",
];

// Transiciones permitidas considerando posibles incidencias
const transicionesValidas = {
  pendiente: ["preparacion"],
  preparacion: ["pendiente", "listo"], // Puede volver atrás por error
  listo: ["preparacion", "reparto", "entregado"], // Recogida puede ir directo a entregado
  reparto: ["listo", "entregado"], // Puede volver a listo si hay incidencia
  entregado: ["reparto"], // Permite corregir un cierre erróneo
};

//Actualizar el estado de un pedido

export const actualizarEstado = async (pedidoId, nuevoEstado, usuario) => {
  // 1. Validar que el estado recibido sea válido
  if (!estadosPermitidos.includes(nuevoEstado)) {
    const error = new Error(
      `Estado inválido. Estados permitidos: ${estadosPermitidos.join(", ")}`,
    );
    error.statusCode = 400;
    throw error;
  }

  // 2. Obtener el pedido existente
  const pedido = await pedidosRepository.findById(pedidoId);

  if (!pedido) {
    const error = new Error("Pedido no encontrado");
    error.statusCode = 404;
    throw error;
  }

  const estadoActual = pedido.estado;

  // 3. Evitar actualizaciones innecesarias
  if (estadoActual === nuevoEstado) {
    return pedido;
  }

  // 4. Restricción por tipo de entrega
  if (pedido.tipo_entrega === "recogida" && nuevoEstado === "reparto") {
    const error = new Error(
      "Los pedidos con tipo de entrega 'recogida' no pueden pasar al estado 'reparto'.",
    );
    error.statusCode = 400;
    throw error;
  }

  // 5. Validar transiciones de estado
  if (!transicionesValidas[estadoActual]?.includes(nuevoEstado)) {
    const error = new Error(
      `Transición de estado no permitida: ${estadoActual} → ${nuevoEstado}`,
    );
    error.statusCode = 400;
    throw error;
  }

  // 6. Validar permisos según el rol del usuario
  const permisosPorRol = {
    cocina: ["preparacion", "listo"],
    repartidor: ["reparto", "entregado"],
    admin: estadosPermitidos, // Acceso total
  };

  if (usuario && !permisosPorRol[usuario.rol]?.includes(nuevoEstado)) {
    const error = new Error(
      `El rol '${usuario.rol}' no tiene permisos para cambiar el estado a '${nuevoEstado}'.`,
    );
    error.statusCode = 403;
    throw error;
  }

  // 7. Actualizar el estado del pedido
  const pedidoActualizado = await pedidosRepository.updateEstado(
    pedidoId,
    nuevoEstado,
  );

  return pedidoActualizado;
};

//Asignar un repartidor a un pedido (autoasignación)

export const asignarRepartidor = async (pedidoId, repartidorId) => {
  const pedido = await pedidosRepository.findById(pedidoId);

  if (!pedido) {
    const error = new Error("Pedido no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (pedido.estado !== "listo" || pedido.tipo_entrega == "recogida") {
    const error = new Error(
      "Solo se pueden asignar pedidos que estén en estado listo o sean de reparto a domicilio",
    );
    error.statusCode = 400;
    throw error;
  }

  const asignacionExistente =
    await pedidosRepository.findAsignacionByPedidoId(pedidoId);

  if (asignacionExistente) {
    const error = new Error("El pedido ya está asignado a un repartidor");
    error.statusCode = 400;
    throw error;
  }

  return await pedidosRepository.asignarRepartidor(pedidoId, repartidorId);
};

//Cancelación lógica del pedido

export const cancelarPedido = async (pedidoId) => {
  const pedido = await pedidosRepository.findById(pedidoId);

  if (!pedido) {
    const error = new Error("Pedido no encontrado");
    error.statusCode = 404;
    throw error;
  }

  if (pedido.estado !== "pendiente") {
    const error = new Error("No se puede cancelar un pedido ya entregado");
    error.statusCode = 400;
    throw error;
  }

  return await pedidosRepository.cancelarPedido(pedidoId);
};
