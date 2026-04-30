// prisma/seed.js
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // =========================
  // 🧹 Limpiar BD (respetando el orden de relaciones FK)
  // =========================
  await prisma.factura.deleteMany();
  await prisma.asignacionReparto.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.lineaPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.cupon.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();

  console.log("🧹 Datos anteriores eliminados");

  // =========================
  // 1. Usuarios
  // =========================
  const password = await hash("123456", 10);

  const admin = await prisma.usuario.create({
    data: {
      nombre: "Admin",
      apellidos: "Sistema",
      email: "admin@pideon.com",
      password_hash: password,
      rol: "admin",
    },
  });

  const cliente1 = await prisma.usuario.create({
    data: {
      nombre: "Juan",
      apellidos: "Pérez",
      email: "cliente@pideon.com",
      password_hash: password,
      rol: "cliente",
    },
  });

  const cliente2 = await prisma.usuario.create({
    data: {
      nombre: "Ana",
      apellidos: "García",
      email: "ana.garcia@pideon.com",
      password_hash: password,
      rol: "cliente",
    },
  });

  const cliente3 = await prisma.usuario.create({
    data: {
      nombre: "Luis",
      apellidos: "Martínez",
      email: "luis.martinez@pideon.com",
      password_hash: password,
      rol: "cliente",
    },
  });

  const cocina = await prisma.usuario.create({
    data: {
      nombre: "María",
      apellidos: "Cocinera",
      email: "cocina@pideon.com",
      password_hash: password,
      rol: "cocina",
    },
  });

  const repartidor1 = await prisma.usuario.create({
    data: {
      nombre: "Carlos",
      apellidos: "Repartidor",
      email: "repartidor@pideon.com",
      password_hash: password,
      rol: "repartidor",
    },
  });

  const repartidor2 = await prisma.usuario.create({
    data: {
      nombre: "Pedro",
      apellidos: "Sánchez",
      email: "pedro.repartidor@pideon.com",
      password_hash: password,
      rol: "repartidor",
    },
  });

  // =========================
  // 2. Categorías
  // NOTA: el campo "orden" NO existe en el schema — eliminado del seed original
  // =========================
  const pizzas = await prisma.categoria.create({
    data: { nombre: "Pizzas", descripcion: "Pizzas artesanales" },
  });

  const bebidas = await prisma.categoria.create({
    data: { nombre: "Bebidas", descripcion: "Refrescos y bebidas" },
  });

  const postres = await prisma.categoria.create({
    data: { nombre: "Postres", descripcion: "Deliciosos postres" },
  });

  const hamburguesas = await prisma.categoria.create({
    data: { nombre: "Hamburguesas", descripcion: "Hamburguesas artesanales" },
  });

  const ensaladas = await prisma.categoria.create({
    data: { nombre: "Ensaladas", descripcion: "Ensaladas frescas" },
  });

  // =========================
  // 3. Productos
  // =========================

  // Pizzas
  const pizzaMargarita = await prisma.producto.create({
    data: {
      nombre: "Pizza Margarita",
      descripcion: "Tomate, mozzarella y albahaca",
      precio: 8.5,
      categoria_id: pizzas.id,
    },
  });

  const pizzaBarbacoa = await prisma.producto.create({
    data: {
      nombre: "Pizza Barbacoa",
      descripcion: "Carne, salsa barbacoa y queso",
      precio: 10.5,
      categoria_id: pizzas.id,
    },
  });

  const pizzaCuatroQuesos = await prisma.producto.create({
    data: {
      nombre: "Pizza Cuatro Quesos",
      descripcion: "Mezcla de cuatro quesos seleccionados",
      precio: 11.0,
      categoria_id: pizzas.id,
    },
  });

  // Bebidas
  const cocaCola = await prisma.producto.create({
    data: {
      nombre: "Coca-Cola",
      descripcion: "Refresco de cola 33cl",
      precio: 2.0,
      categoria_id: bebidas.id,
    },
  });

  const agua = await prisma.producto.create({
    data: {
      nombre: "Agua Mineral",
      descripcion: "Agua mineral 50cl",
      precio: 1.5,
      categoria_id: bebidas.id,
    },
  });

  const zumoNaranja = await prisma.producto.create({
    data: {
      nombre: "Zumo de Naranja",
      descripcion: "Zumo natural de naranja",
      precio: 2.5,
      categoria_id: bebidas.id,
    },
  });

  // Postres
  const tartaQueso = await prisma.producto.create({
    data: {
      nombre: "Tarta de Queso",
      descripcion: "Tarta casera estilo NY",
      precio: 4.5,
      categoria_id: postres.id,
    },
  });

  const brownie = await prisma.producto.create({
    data: {
      nombre: "Brownie con Helado",
      descripcion: "Brownie de chocolate con bola de vainilla",
      precio: 5.0,
      categoria_id: postres.id,
    },
  });

  // Hamburguesas
  const burguerClasica = await prisma.producto.create({
    data: {
      nombre: "Burger Clásica",
      descripcion: "Ternera, lechuga, tomate y queso cheddar",
      precio: 9.0,
      categoria_id: hamburguesas.id,
    },
  });

  const burguerBacon = await prisma.producto.create({
    data: {
      nombre: "Burger Bacon",
      descripcion: "Ternera, bacon crujiente, queso y cebolla caramelizada",
      precio: 10.5,
      categoria_id: hamburguesas.id,
    },
  });

  // Ensaladas
  const ensaladaCesar = await prisma.producto.create({
    data: {
      nombre: "Ensalada César",
      descripcion: "Lechuga romana, pollo, croutons y aderezo César",
      precio: 7.5,
      categoria_id: ensaladas.id,
    },
  });

  const ensaladaMixta = await prisma.producto.create({
    data: {
      nombre: "Ensalada Mixta",
      descripcion: "Lechuga, tomate, zanahoria y maíz",
      precio: 5.5,
      categoria_id: ensaladas.id,
    },
  });

  // =========================
  // 4. Cupones
  // =========================

  // Cupón activo con usos disponibles
  const cuponBienvenido = await prisma.cupon.create({
    data: {
      codigo: "BIENVENIDO10",
      tipo_descuento: "porcentaje",
      valor: 10,
      fecha_inicio: new Date("2024-01-01"),
      fecha_fin: new Date("2027-12-31"),
      usos_maximos: 100,
      usos_actuales: 3,
    },
  });

  // Cupón agotado (usos_actuales == usos_maximos, marcado inactivo)
  const cuponVerano = await prisma.cupon.create({
    data: {
      codigo: "VERANO20",
      tipo_descuento: "porcentaje",
      valor: 20,
      fecha_inicio: new Date("2025-06-01"),
      fecha_fin: new Date("2025-09-30"),
      usos_maximos: 50,
      usos_actuales: 50,
      activo: false,
    },
  });

  // Cupón de fidelidad activo
  const cuponFidelidad = await prisma.cupon.create({
    data: {
      codigo: "FIDELIDAD15",
      tipo_descuento: "porcentaje",
      valor: 15,
      fecha_inicio: new Date("2026-01-01"),
      fecha_fin: new Date("2026-12-31"),
      usos_maximos: 200,
      usos_actuales: 12,
    },
  });

  // =========================
  // PEDIDO 1 ✅ Entregado · Domicilio · Tarjeta · Con cupón 10%
  // subtotal: 2×8.5 + 2×2.0 = 21.00 → descuento 2.10 → pago 18.90
  // =========================
  const pedido1 = await prisma.pedido.create({
    data: {
      usuario_id: cliente1.id,
      cupon_id: cuponBienvenido.id,
      estado: "entregado",
      tipo_entrega: "domicilio",
      entrega_calle: "Calle Mayor",
      entrega_numero: "10",
      entrega_piso: "2A",
      entrega_ciudad: "Las Palmas",
      entrega_cp: "35001",
      telefono: "681989989",
      total: 21.0,
      descuento_aplicado: 2.1,
      notas: "Casa amarilla",
    },
  });
  await prisma.lineaPedido.createMany({
    data: [
      { pedido_id: pedido1.id, producto_id: pizzaMargarita.id, cantidad: 2, precio_unitario: 8.5 },
      { pedido_id: pedido1.id, producto_id: cocaCola.id, cantidad: 2, precio_unitario: 2.0 },
    ],
  });
  await prisma.pago.create({
    data: {
      pedido_id: pedido1.id,
      metodo: "tarjeta",
      estado: "completado",
      importe: 18.9,
      referencia_externa: "PAY-001-TARJETA",
      fecha_pago: new Date("2026-03-10T14:30:00"),
    },
  });
  await prisma.asignacionReparto.create({
    data: {
      pedido_id: pedido1.id,
      repartidor_id: repartidor1.id,
      asignado_en: new Date("2026-03-10T14:00:00"),
      entregado_en: new Date("2026-03-10T14:25:00"),
    },
  });
  await prisma.factura.create({
    data: {
      pedido_id: pedido1.id,
      numero_factura: "FAC-0001",
      pdf_url: "https://example.com/facturas/FAC-0001.pdf",
    },
  });

  // =========================
  // PEDIDO 2 ✅ Entregado · Recogida · Efectivo · Sin cupón
  // subtotal: 9.00 + 10.50 = 19.50
  // =========================
  const pedido2 = await prisma.pedido.create({
    data: {
      usuario_id: cliente2.id,
      estado: "entregado",
      tipo_entrega: "recogida",
      telefono: "612345678",
      total: 19.5,
      descuento_aplicado: 0,
    },
  });
  await prisma.lineaPedido.createMany({
    data: [
      { pedido_id: pedido2.id, producto_id: burguerClasica.id, cantidad: 1, precio_unitario: 9.0 },
      { pedido_id: pedido2.id, producto_id: burguerBacon.id, cantidad: 1, precio_unitario: 10.5 },
    ],
  });
  await prisma.pago.create({
    data: {
      pedido_id: pedido2.id,
      metodo: "efectivo",
      estado: "completado",
      importe: 19.5,
      fecha_pago: new Date("2026-03-12T13:15:00"),
    },
  });
  await prisma.factura.create({
    data: {
      pedido_id: pedido2.id,
      numero_factura: "FAC-0002",
      pdf_url: "https://example.com/facturas/FAC-0002.pdf",
    },
  });

  // =========================
  // PEDIDO 3 🛵 En reparto · Domicilio · Bizum · Cupón fidelidad 15%
  // subtotal: 10.5 + 11.0 + 2×2.0 + 5.0 = 30.50 → descuento 4.58 → pago 25.92
  // =========================
  const pedido3 = await prisma.pedido.create({
    data: {
      usuario_id: cliente3.id,
      cupon_id: cuponFidelidad.id,
      estado: "reparto",
      tipo_entrega: "domicilio",
      entrega_calle: "Avenida Mesa y López",
      entrega_numero: "45",
      entrega_piso: "3B",
      entrega_ciudad: "Las Palmas",
      entrega_cp: "35006",
      telefono: "698765432",
      total: 30.5,
      descuento_aplicado: 4.58,
      notas: "Timbre roto, llamar por teléfono",
    },
  });
  await prisma.lineaPedido.createMany({
    data: [
      { pedido_id: pedido3.id, producto_id: pizzaBarbacoa.id, cantidad: 1, precio_unitario: 10.5 },
      { pedido_id: pedido3.id, producto_id: pizzaCuatroQuesos.id, cantidad: 1, precio_unitario: 11.0 },
      { pedido_id: pedido3.id, producto_id: cocaCola.id, cantidad: 2, precio_unitario: 2.0 },
      { pedido_id: pedido3.id, producto_id: brownie.id, cantidad: 1, precio_unitario: 5.0 },
    ],
  });
  await prisma.pago.create({
    data: {
      pedido_id: pedido3.id,
      metodo: "bizum",
      estado: "completado",
      importe: 25.92,
      referencia_externa: "BIZ-003-FIDELIDAD",
      fecha_pago: new Date(),
    },
  });
  await prisma.asignacionReparto.create({
    data: {
      pedido_id: pedido3.id,
      repartidor_id: repartidor2.id,
      asignado_en: new Date(),
      // entregado_en: null — aún en camino
    },
  });

  // =========================
  // PEDIDO 4 🍳 En preparación · Domicilio · Tarjeta · Sin cupón
  // subtotal: 7.5 + 9.0 + 2×1.5 = 19.50
  // =========================
  const pedido4 = await prisma.pedido.create({
    data: {
      usuario_id: cliente1.id,
      estado: "preparacion",
      tipo_entrega: "domicilio",
      entrega_calle: "Calle Triana",
      entrega_numero: "22",
      entrega_ciudad: "Las Palmas",
      entrega_cp: "35002",
      telefono: "681989989",
      total: 19.5,
      descuento_aplicado: 0,
    },
  });
  await prisma.lineaPedido.createMany({
    data: [
      { pedido_id: pedido4.id, producto_id: ensaladaCesar.id, cantidad: 1, precio_unitario: 7.5 },
      { pedido_id: pedido4.id, producto_id: burguerClasica.id, cantidad: 1, precio_unitario: 9.0 },
      { pedido_id: pedido4.id, producto_id: agua.id, cantidad: 2, precio_unitario: 1.5 },
    ],
  });
  await prisma.pago.create({
    data: {
      pedido_id: pedido4.id,
      metodo: "tarjeta",
      estado: "completado",
      importe: 19.5,
      referencia_externa: "PAY-004-TARJETA",
      fecha_pago: new Date(),
    },
  });

  // =========================
  // PEDIDO 5 ✔️ Listo · Recogida · Bizum · Notas en línea
  // subtotal: 5.5 + 2.5 + 1.5 = 9.50
  // =========================
  const pedido5 = await prisma.pedido.create({
    data: {
      usuario_id: cliente2.id,
      estado: "listo",
      tipo_entrega: "recogida",
      telefono: "612345678",
      total: 9.5,
      descuento_aplicado: 0,
      notas: "Recoger antes de las 20:00",
    },
  });
  await prisma.lineaPedido.createMany({
    data: [
      {
        pedido_id: pedido5.id,
        producto_id: ensaladaMixta.id,
        cantidad: 1,
        precio_unitario: 5.5,
        notas_linea: "Sin zanahoria",
      },
      { pedido_id: pedido5.id, producto_id: zumoNaranja.id, cantidad: 1, precio_unitario: 2.5 },
      { pedido_id: pedido5.id, producto_id: agua.id, cantidad: 1, precio_unitario: 1.5 },
    ],
  });
  await prisma.pago.create({
    data: {
      pedido_id: pedido5.id,
      metodo: "bizum",
      estado: "completado",
      importe: 9.5,
      referencia_externa: "BIZ-005",
      fecha_pago: new Date(),
    },
  });

  // =========================
  // PEDIDO 6 ⏳ Pendiente · Domicilio · Efectivo · Pago pendiente
  // subtotal: 8.5 + 10.5 + 4.5 = 23.50
  // =========================
  const pedido6 = await prisma.pedido.create({
    data: {
      usuario_id: cliente3.id,
      estado: "pendiente",
      tipo_entrega: "domicilio",
      entrega_calle: "Calle León y Castillo",
      entrega_numero: "5",
      entrega_ciudad: "Las Palmas",
      entrega_cp: "35003",
      telefono: "698765432",
      total: 23.5,
      descuento_aplicado: 0,
    },
  });
  await prisma.lineaPedido.createMany({
    data: [
      { pedido_id: pedido6.id, producto_id: pizzaMargarita.id, cantidad: 1, precio_unitario: 8.5 },
      { pedido_id: pedido6.id, producto_id: burguerBacon.id, cantidad: 1, precio_unitario: 10.5 },
      { pedido_id: pedido6.id, producto_id: tartaQueso.id, cantidad: 1, precio_unitario: 4.5 },
    ],
  });
  await prisma.pago.create({
    data: {
      pedido_id: pedido6.id,
      metodo: "efectivo",
      estado: "pendiente",
      importe: 23.5,
      // fecha_pago: null — aún no pagado
    },
  });

  // =========================
  // PEDIDO 7 ❌ Entregado · Domicilio · Tarjeta fallida
  // subtotal: 8.5 + 4.5 + 1.5 = 14.50
  // =========================
  const pedido7 = await prisma.pedido.create({
    data: {
      usuario_id: cliente1.id,
      estado: "entregado",
      tipo_entrega: "domicilio",
      entrega_calle: "Calle Venegas",
      entrega_numero: "3",
      entrega_ciudad: "Las Palmas",
      entrega_cp: "35001",
      telefono: "681989989",
      total: 14.5,
      descuento_aplicado: 0,
      notas: "Dejar en recepción si no hay nadie",
    },
  });
  await prisma.lineaPedido.createMany({
    data: [
      { pedido_id: pedido7.id, producto_id: pizzaMargarita.id, cantidad: 1, precio_unitario: 8.5 },
      { pedido_id: pedido7.id, producto_id: tartaQueso.id, cantidad: 1, precio_unitario: 4.5 },
      { pedido_id: pedido7.id, producto_id: agua.id, cantidad: 1, precio_unitario: 1.5 },
    ],
  });
  // Pago con tarjeta fallido (cobro rechazado)
  await prisma.pago.create({
    data: {
      pedido_id: pedido7.id,
      metodo: "tarjeta",
      estado: "fallido",
      importe: 14.5,
      referencia_externa: "PAY-007-RECHAZADA",
      // fecha_pago: null — nunca completado
    },
  });
  await prisma.asignacionReparto.create({
    data: {
      pedido_id: pedido7.id,
      repartidor_id: repartidor1.id,
      asignado_en: new Date("2026-04-01T18:30:00"),
      entregado_en: new Date("2026-04-01T18:55:00"),
      incidencia: "El cliente no pudo pagar con tarjeta. Pago pendiente de regularizar.",
    },
  });
  await prisma.factura.create({
    data: {
      pedido_id: pedido7.id,
      numero_factura: "FAC-0003",
      pdf_url: "https://example.com/facturas/FAC-0003.pdf",
    },
  });

  // =========================
  // PEDIDO 8 ✅ Entregado · Domicilio · Tarjeta · Incidencia en reparto
  // subtotal: 2×10.5 + 2×2.0 + 5.0 = 30.00
  // =========================
  const pedido8 = await prisma.pedido.create({
    data: {
      usuario_id: cliente2.id,
      estado: "entregado",
      tipo_entrega: "domicilio",
      entrega_calle: "Calle Sagasta",
      entrega_numero: "18",
      entrega_piso: "1C",
      entrega_ciudad: "Las Palmas",
      entrega_cp: "35008",
      telefono: "612345678",
      total: 30.0,
      descuento_aplicado: 0,
      notas: "Entregar antes de las 21:00",
    },
  });
  await prisma.lineaPedido.createMany({
    data: [
      { pedido_id: pedido8.id, producto_id: pizzaBarbacoa.id, cantidad: 2, precio_unitario: 10.5 },
      { pedido_id: pedido8.id, producto_id: cocaCola.id, cantidad: 2, precio_unitario: 2.0 },
      { pedido_id: pedido8.id, producto_id: brownie.id, cantidad: 1, precio_unitario: 5.0 },
    ],
  });
  await prisma.pago.create({
    data: {
      pedido_id: pedido8.id,
      metodo: "tarjeta",
      estado: "completado",
      importe: 30.0,
      referencia_externa: "PAY-008-TARJETA",
      fecha_pago: new Date("2026-04-05T21:10:00"),
    },
  });
  await prisma.asignacionReparto.create({
    data: {
      pedido_id: pedido8.id,
      repartidor_id: repartidor2.id,
      asignado_en: new Date("2026-04-05T20:30:00"),
      entregado_en: new Date("2026-04-05T21:05:00"),
      incidencia: "Cliente tardó en abrir. Entregado con 5 min de retraso.",
    },
  });
  await prisma.factura.create({
    data: {
      pedido_id: pedido8.id,
      numero_factura: "FAC-0004",
      pdf_url: "https://example.com/facturas/FAC-0004.pdf",
    },
  });

  // =========================
  // PEDIDO 9 ⏳ Pendiente · Recogida · Tarjeta · Usuario inactivo simulado
  // subtotal: 2×11.0 + 2.5 = 24.50
  // =========================
  const pedido9 = await prisma.pedido.create({
    data: {
      usuario_id: cliente3.id,
      estado: "pendiente",
      tipo_entrega: "recogida",
      telefono: "698765432",
      total: 24.5,
      descuento_aplicado: 0,
    },
  });
  await prisma.lineaPedido.createMany({
    data: [
      { pedido_id: pedido9.id, producto_id: pizzaCuatroQuesos.id, cantidad: 2, precio_unitario: 11.0 },
      { pedido_id: pedido9.id, producto_id: zumoNaranja.id, cantidad: 1, precio_unitario: 2.5 },
    ],
  });
  await prisma.pago.create({
    data: {
      pedido_id: pedido9.id,
      metodo: "tarjeta",
      estado: "pendiente",
      importe: 24.5,
    },
  });

  console.log("✅ Seed completado correctamente");
  console.log("📋 Resumen:");
  console.log("   👤 Usuarios  : 7  (1 admin · 3 clientes · 1 cocina · 2 repartidores)");
  console.log("   🗂️  Categorías: 5  (Pizzas · Bebidas · Postres · Hamburguesas · Ensaladas)");
  console.log("   🍕 Productos : 12");
  console.log("   🎟️  Cupones   : 3  (activo · agotado · fidelidad)");
  console.log("   📦 Pedidos   : 9");
  console.log("      · entregado (domicilio, tarjeta, cupón)    → P1");
  console.log("      · entregado (recogida, efectivo)           → P2");
  console.log("      · en reparto (domicilio, bizum, cupón)     → P3");
  console.log("      · en preparación (domicilio, tarjeta)      → P4");
  console.log("      · listo para recogida (bizum)              → P5");
  console.log("      · pendiente (domicilio, efectivo)          → P6");
  console.log("      · entregado con pago fallido (tarjeta)     → P7");
  console.log("      · entregado con incidencia en reparto      → P8");
  console.log("      · pendiente (recogida, tarjeta)            → P9");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });