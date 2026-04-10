// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
async function main() {
  console.log("🌱 Iniciando seed...");

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
      telefono: "600000001",
      rol: "admin",
    },
  });

  const cliente = await prisma.usuario.create({
    data: {
      nombre: "Juan",
      apellidos: "Pérez",
      email: "cliente@pideon.com",
      password_hash: password,
      telefono: "600000002",
      rol: "cliente",
    },
  });

  const cocina = await prisma.usuario.create({
    data: {
      nombre: "María",
      apellidos: "Cocinera",
      email: "cocina@pideon.com",
      password_hash: password,
      telefono: "600000003",
      rol: "cocina",
    },
  });

  const repartidor = await prisma.usuario.create({
    data: {
      nombre: "Carlos",
      apellidos: "Repartidor",
      email: "repartidor@pideon.com",
      password_hash: password,
      telefono: "600000004",
      rol: "repartidor",
    },
  });

  // =========================
  // 2. Categorías
  // =========================
  const pizzas = await prisma.categoria.create({
    data: {
      nombre: "Pizzas",
      descripcion: "Pizzas artesanales",
      orden: 1,
    },
  });

  const bebidas = await prisma.categoria.create({
    data: {
      nombre: "Bebidas",
      descripcion: "Refrescos y bebidas",
      orden: 2,
    },
  });

  const postres = await prisma.categoria.create({
    data: {
      nombre: "Postres",
      descripcion: "Deliciosos postres",
      orden: 3,
    },
  });

  // =========================
  // 3. Productos
  // =========================
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

  const cocaCola = await prisma.producto.create({
    data: {
      nombre: "Coca-Cola",
      descripcion: "Refresco de cola",
      precio: 2.0,
      categoria_id: bebidas.id,
    },
  });

  const tartaQueso = await prisma.producto.create({
    data: {
      nombre: "Tarta de Queso",
      descripcion: "Tarta casera",
      precio: 4.5,
      categoria_id: postres.id,
    },
  });

  // =========================
  // 4. Cupón
  // =========================
  const cupon = await prisma.cupon.create({
    data: {
      codigo: "BIENVENIDO10",
      tipo_descuento: "porcentaje",
      valor: 10,
      fecha_inicio: new Date(),
      fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      usos_maximos: 100,
    },
  });

  // =========================
  // 5. Pedido
  // =========================
  const pedido = await prisma.pedido.create({
    data: {
      usuario_id: cliente.id,
      cupon_id: cupon.id,
      estado: "entregado",
      tipo_entrega: "domicilio",
      entrega_calle: "Calle Mayor",
      entrega_numero: "10",
      entrega_piso: "2A",
      entrega_ciudad: "Las Palmas",
      entrega_cp: "35001",
      total: 21.0,
      descuento_aplicado: 2.1,
      notas: "Casa amarilla",
    },
  });

  // =========================
  // 6. Líneas de pedido
  // =========================
  await prisma.lineaPedido.createMany({
    data: [
      {
        pedido_id: pedido.id,
        producto_id: pizzaMargarita.id,
        cantidad: 2,
        precio_unitario: 8.5,
      },
      {
        pedido_id: pedido.id,
        producto_id: cocaCola.id,
        cantidad: 2,
        precio_unitario: 2.0,
      },
    ],
  });

  // =========================
  // 7. Pago
  // =========================
  await prisma.pago.create({
    data: {
      pedido_id: pedido.id,
      metodo: "tarjeta",
      estado: "completado",
      importe: 18.9,
      referencia_externa: "PAY123456",
      fecha_pago: new Date(),
    },
  });

  // =========================
  // 8. Asignación de reparto
  // =========================
  await prisma.asignacionReparto.create({
    data: {
      pedido_id: pedido.id,
      repartidor_id: repartidor.id,
      asignado_en: new Date(),
      entregado_en: new Date(),
    },
  });

  // =========================
  // 9. Factura
  // =========================
  await prisma.factura.create({
    data: {
      pedido_id: pedido.id,
      numero_factura: "FAC-0001",
      pdf_url: "https://example.com/factura/FAC-0001.pdf",
    },
  });

  console.log("✅ Seed completado correctamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
