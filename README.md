<div align="center">

# 🍕 PideON

**Plataforma full-stack de pedidos para restaurantes — del cliente al repartidor.**

[![Live Demo](https://img.shields.io/badge/demo-pideon.vercel.app-orange?style=for-the-badge&logo=vercel)](https://pideon.vercel.app)
[![API](https://img.shields.io/badge/API-render-46e3b7?style=for-the-badge&logo=render)](https://pideon.onrender.com/api/health)
[![Repo](https://img.shields.io/badge/repo-github-181717?style=for-the-badge&logo=github)](https://github.com/KevinDiazz/pideon)

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Jest](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)](https://jestjs.io/)

</div>

---

## ¿Qué es PideON?

Aplicación web que cubre **el ciclo completo de un pedido en un restaurante**: el cliente navega la carta y construye su carrito, cocina marca los pedidos como preparados, los repartidores se autoasignan los disponibles y los entregan, y el administrador gestiona la carta y supervisa todo el flujo. Una vez entregado, se genera la factura simplificada en PDF.

> 🔗 **Pruébalo en vivo:** [pideon.vercel.app](https://pideon.vercel.app)
---
[![Demo del proyecto](https://img.youtube.com/vi/nvpqZsZIjyM/0.jpg)](https://www.youtube.com/watch?v=nvpqZsZIjyM)
---

## ✨ Características

- 🛒 **Catálogo navegable** con sidebar de categorías y filtros, drawer móvil con overlay
- 🔐 **Autenticación JWT** con cuatro roles (cliente, cocina, repartidor, admin)
- 📦 **Checkout** con dirección de entrega (domicilio o recogida) y teléfono
- 👨‍🍳 **Panel de cocina** — pedidos pendientes y en preparación, transición de estado en un click
- 🛵 **Panel de repartidor** con tres pestañas (`Disponibles`, `Mis repartos`, `Entregados`) y autoasignación atómica
- 🛡️ **Panel de admin** — CRUD de categorías y productos (con subida de imagen a Cloudinary)
- 📄 **Factura PDF** generada con PDFKit y servida en streaming
- 📱 **UI responsive** mobile-first con TailwindCSS 4
- ⚡ **Optimistic updates y refetch en background** con TanStack Query

---

## 🛠️ Stack

**Frontend** — React 19 · Vite 8 · TailwindCSS 4 · React Router 7 · TanStack Query 5 · Zustand 5 · Axios

**Backend** — Node 20+ · Express 5 · Prisma 7 · PostgreSQL · JWT + bcryptjs · Helmet · Multer + Cloudinary · PDFKit

**Testing** — Jest · Supertest  (unitarios + integración)

**Infraestructura** — Vercel (frontend) · Render (API) · Neon (Postgres serverless en Frankfurt) · Cloudinary (imágenes) · GitHub (CI por push)

---

## 👥 Roles y permisos

| Rol | Puede |
|---|---|
| **cliente** | Ver carta, gestionar carrito, hacer checkout, consultar sus pedidos, descargar factura |
| **cocina** | Ver pedidos pendientes y en preparación, marcarlos como listos |
| **repartidor** | Ver pedidos listos a domicilio, autoasignárselos, marcarlos como entregados |
| **admin** | Todo lo anterior + CRUD de categorías y productos, gestión de pedidos |

Autorización aplicada en backend con middleware `authorize(...roles)` y en frontend con `<ProtectedRoute allowedRoles={[...]}/>`.

---

## 📋 Flujo de un pedido

```
cliente              cocina           repartidor           cliente / admin
[1] crea  ─────► pendiente
                 [2] acepta
                 ─────────► preparación
                 [3] termina
                 ─────────► listo
                                     [4] se asigna
                                     ─────────────► reparto
                                     [5] entrega
                                     ─────────────► entregado
                                                          [6] descarga PDF
```

---

## 💡 Decisiones técnicas destacadas

**Autoasignación atómica de repartos.** Para evitar que dos repartidores se queden con el mismo pedido, el `update` de asignación va con condición sobre `repartidor_id IS NULL`. Si dos clicks llegan a la vez, solo uno gana.

**Server-state vs client-state.** TanStack Query gestiona todo lo que viene del backend (pedidos, productos, categorías) con caché y refetch en background. Zustand solo guarda lo realmente local: auth, carrito y estado de UI.

**Factura en streaming.** PDFKit produce el PDF y se hace `pipe(res)` directamente sin escribir a disco. En el frontend, axios lo descarga como blob y lo dispara con un `<a download>` temporal.

**Despliegue serverless-first.** Frontend en Vercel (CDN), backend en Render con `prisma generate` en `postinstall` y `prisma migrate deploy` al arrancar, Postgres en Neon (Frankfurt) y Cloudinary para imágenes.

**Splash de cold start.** Como Render duerme tras 15 min sin tráfico, la primera carga muestra un splash con cronómetro que hace ping a `/api/health` y desaparece cuando el backend responde.

---

<details>
<summary><strong>📊 Modelo de datos (9 modelos)</strong></summary>

- **Usuario** — `id, nombre, apellidos, email (unique), password_hash, rol, activo`
- **Categoria** — `id, nombre (unique), descripcion, activa`
- **Producto** — `id, categoria_id, nombre, descripcion, precio, imagen_url, imagen_public_id, disponible`
- **Pedido** — `id, usuario_id, cupon_id, estado, tipo_entrega, telefono, entrega_*, total, descuento_aplicado, notas`
- **LineaPedido** — `id, pedido_id, producto_id, cantidad, precio_unitario, notas_linea`
- **Pago** — `id, pedido_id (unique), metodo, estado, importe, referencia_externa, fecha_pago`
- **Cupon** — `id, codigo (unique), tipo_descuento, valor, fecha_inicio, fecha_fin, usos_maximos, usos_actuales, activo`
- **AsignacionReparto** — `id, pedido_id, repartidor_id, asignado_en, entregado_en, incidencia`
- **Factura** — `id, pedido_id (unique), numero_factura (unique), fecha_emision, pdf_url`

**Enums:**
- `Rol`: cliente | cocina | repartidor | admin
- `EstadoPedido`: pendiente | preparacion | listo | reparto | entregado
- `TipoEntrega`: domicilio | recogida
- `MetodoPago`: tarjeta | efectivo | bizum
- `EstadoPago`: pendiente | completado | fallido
- `TipoDescuento`: porcentaje

</details>

<details>
<summary><strong>🌐 API REST completa</strong></summary>

Todas las rutas bajo `/api`. Header de autenticación: `Authorization: Bearer <jwt>`.

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/register` | público | Registra un usuario (rol `cliente`) |
| `POST` | `/login` | público | Devuelve `{ token, user }` |
| `GET` | `/me` | autenticado | Datos del usuario del token |

### Categorías (`/api/categories`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/` | público | Lista categorías |
| `GET` | `/:id` | público | Una categoría |
| `POST` | `/` | admin | Crea categoría |
| `PUT` | `/:id` | admin | Actualiza categoría |
| `DELETE` | `/:id` | admin | Elimina categoría |

### Productos (`/api/products`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/` | público | Lista productos |
| `GET` | `/:id` | público | Un producto |
| `GET` | `/categories/:categoria_id` | público | Productos de una categoría |
| `POST` | `/` | admin | Crea producto (multipart, campo `imagen`) |
| `PUT` | `/:id` | admin | Actualiza producto |
| `DELETE` | `/:id` | admin | Elimina producto |

### Pedidos (`/api/orders`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/` | cliente | Crea un pedido a partir del carrito |
| `GET` | `/mis-pedidos` | cliente | Pedidos propios |
| `GET` | `/pendientes` | cocina, admin | Pedidos en estado `pendiente` |
| `GET` | `/listos` | repartidor, admin | Pedidos en estado `listo` |
| `GET` | `/mis-repartos` | repartidor, admin | Pedidos asignados al repartidor |
| `GET` | `/` | admin, cocina | Todos los pedidos |
| `GET` | `/:id` | admin, cocina, repartidor | Un pedido por id |
| `GET` | `/:id/factura` | cliente, admin, cocina, repartidor | Factura PDF (binario) |
| `PATCH` | `/:id/estado` | admin, cocina, repartidor | Cambia el estado |
| `PATCH` | `/:id/asignar-repartidor` | repartidor | Autoasignación |

### Otros

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/upload` | admin | Sube imagen a Cloudinary |
| `GET` | `/api/health` | público | Healthcheck |

</details>

---

## 👤 Autor

**Kevin Diaz** — [GitHub](https://github.com/KevinDiazz) · [kevinds1895@gmail.com](mailto:kevinds1895@gmail.com)
