# PideON

> Plataforma web de pedidos para restaurantes — del cliente al repartidor, pasando por cocina y administración.

PideON es una aplicación full-stack que cubre el ciclo completo de un pedido en hostelería: el cliente navega la carta y construye su carrito, cocina ve los pedidos pendientes y los marca como listos, los repartidores se autoasignan los pedidos disponibles y los entregan, y el administrador gestiona la carta, las categorías y supervisa todo el flujo. Una vez entregado el pedido, todos los actores pueden descargar la factura simplificada en PDF.

---

## Tabla de contenidos

1. [Video](#video)
2. [Características](#características)
3. [Stack tecnológico](#stack-tecnológico)
9. [Roles y permisos](#roles-y-permisos)
10. [Flujo de un pedido](#flujo-de-un-pedido)
11. [Modelo de datos](#modelo-de-datos)
12. [API REST](#api-rest)
13. [Decisiones técnicas](#decisiones-técnicas)
15. [Posibles mejoras](#posibles-mejoras)

---

## Video
[Ver video](docs/screenshots/grabación.mp4)
---

## Características

- **Catálogo navegable** con sidebar de categorías y filtros, también en móvil (drawer lateral con overlay).
- **Carrito persistente** por usuario con cantidades editables y subtotal calculado en cliente.
- **Checkout con dirección de entrega** (a domicilio o recogida) y registro de teléfono.
- **Autenticación JWT** con cuatro roles funcionales (cliente, cocina, repartidor y administrador).
- **Panel de cocina**: pedidos pendientes y en preparación, transición de estado en un click.
- **Panel de repartidor con tres pestañas** (`Disponibles`, `Mis repartos`, `Entregados`). Autoasignación atómica para evitar carreras entre repartidores.
- **Panel de admin** para CRUD de categorías y productos (con subida de imagen a Cloudinary), gestión de pedidos y transición `listo → entregado`.
- **Factura simplificada en PDF** generada con PDFKit y servida en streaming, descargable por cliente, repartidor y admin para cada pedido entregado.
- **UI responsive** mobile-first con TailwindCSS 4.
- **Optimistic updates y refetch en background** en todo el panel operativo (TanStack Query) para sensación instantánea sin perder consistencia.
---

## Stack tecnológico

### Backend

| Tecnología | Versión | Para qué |
| --- | --- | --- |
| Node.js | >= 20 | Runtime |
| Express | 5 | Servidor HTTP y routing |
| Prisma | 7 | ORM y migraciones |
| PostgreSQL | >= 14 | Base de datos relacional |
| jsonwebtoken | 9 | Emisión y verificación de JWT |
| bcryptjs | 3 | Hash de contraseñas |
| express-validator | 7 | Validación de inputs |
| helmet | 8 | Cabeceras de seguridad |
| morgan | 1 | Logging de peticiones |
| multer + Cloudinary | 2 / 1.41 | Subida y hosting de imágenes |
| PDFKit | 0.18 | Generación de facturas en PDF |

### Frontend

| Tecnología | Versión | Para qué |
| --- | --- | --- |
| React | 19 | UI declarativa |
| Vite | 8 | Build tool y dev server |
| React Router | 7 | Routing del SPA |
| TanStack Query | 5 | Caché y sincronización del estado de servidor |
| Zustand | 5 | Estado global del cliente (auth, carrito, repartidor) |
| Axios | 1 | Cliente HTTP con interceptores |
| TailwindCSS | 4 | Estilos utility-first |
| lucide-react | 1 | Iconografía |


## Roles y permisos

| Rol | Puede |
| --- | --- |
| **cliente** | Ver carta, gestionar carrito, hacer checkout, consultar sus pedidos, descargar su factura. |
| **cocina** | Ver pedidos pendientes y en preparación, marcarlos como listos. |
| **repartidor** | Ver pedidos listos a domicilio, autoasignárselos, marcarlos como entregados, ver su histórico. |
| **admin** | Todo lo anterior + CRUD de categorías y productos, gestión de pedidos, transición `listo → entregado`. |

La autorización se aplica a nivel de ruta en el backend mediante el middleware `authorize(...roles)` y a nivel de pantalla en el frontend mediante `<ProtectedRoute allowedRoles={[...]}/>`.

---

## Flujo de un pedido

```
   cliente               cocina           repartidor             cliente / admin
   -------               ------           ----------             ----------------
[1] crea  ---------> pendiente
                    [2] acepta
                    ---------->  preparacion
                    [3] termina
                    ---------->  listo
                                       [4] se asigna
                                       -------------> reparto
                                       [5] entrega
                                       -------------> entregado
                                                            [6] descarga factura PDF
```

1. El cliente confirma el carrito en `/checkout`. Se crea un `Pedido` en estado `pendiente`.
2. Cocina lo ve en su panel y lo pasa a `preparacion`.
3. Una vez preparado lo marca como `listo`.
4. Si es a domicilio, aparece en la pestaña *Disponibles* del repartidor; éste se autoasigna y el pedido pasa a `reparto`.
5. Tras la entrega lo marca como `entregado`.
6. El admin (o cocina, repartidor, o el propio cliente desde *Mis pedidos*) puede descargar la factura PDF.

---

## Modelo de datos

Los nueve modelos de Prisma (`backend/prisma/schema.prisma`):

- **Usuario** — `id, nombre, apellidos, email (unique), password_hash, rol, activo`. Relación 1:N con `Pedido` (cliente) y con `AsignacionReparto` (repartidor).
- **Categoria** — `id, nombre (unique), descripcion, activa`. 1:N con `Producto`.
- **Producto** — `id, categoria_id, nombre, descripcion, precio, imagen_url, imagen_public_id, disponible`. N:1 con `Categoria`.
- **Pedido** — `id, usuario_id, cupon_id, estado, tipo_entrega, telefono, entrega_calle/numero/piso/ciudad/cp, total, descuento_aplicado, notas`. Relaciones con `Usuario`, `Cupon`, `LineaPedido`, `Pago`, `Factura`, `AsignacionReparto`.
- **LineaPedido** — `id, pedido_id, producto_id, cantidad, precio_unitario, notas_linea`. Snapshot del precio en el momento del pedido.
- **Pago** — `id, pedido_id (unique), metodo, estado, importe, referencia_externa, fecha_pago`. Reservado para integración con Stripe.
- **Cupon** — `id, codigo (unique), tipo_descuento, valor, fecha_inicio, fecha_fin, usos_maximos, usos_actuales, activo`.
- **AsignacionReparto** — `id, pedido_id, repartidor_id, asignado_en, entregado_en, incidencia`. Permite auditar la asignación de cada pedido a un repartidor.
- **Factura** — `id, pedido_id (unique), numero_factura (unique), fecha_emision, pdf_url`. Persistencia opcional; el PDF se genera bajo demanda en streaming.

Enums:

- `Rol`: `cliente | cocina | repartidor | admin`
- `EstadoPedido`: `pendiente | preparacion | listo | reparto | entregado`
- `TipoEntrega`: `domicilio | recogida`
- `MetodoPago`: `tarjeta | efectivo | bizum`
- `EstadoPago`: `pendiente | completado | fallido`
- `TipoDescuento`: `porcentaje`

---

## API REST

Todas las rutas están bajo el prefijo `/api`. El header de autenticación es `Authorization: Bearer <jwt>`.

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `POST` | `/register` | público | Registra un usuario (rol `cliente`). |
| `POST` | `/login` | público | Devuelve `{ token, user }`. |
| `GET` | `/me` | autenticado | Devuelve los datos del usuario del token. |

### Categorías (`/api/categories`)

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/` | público | Lista categorías. |
| `GET` | `/:id` | público | Una categoría. |
| `POST` | `/` | admin | Crea una categoría. |
| `PUT` | `/:id` | admin | Actualiza una categoría. |
| `DELETE` | `/:id` | admin | Elimina una categoría. |

### Productos (`/api/products`)

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/` | público | Lista productos. |
| `GET` | `/:id` | público | Un producto. |
| `GET` | `/categories/:categoria_id` | público | Productos de una categoría. |
| `POST` | `/` | admin | Crea producto (multipart, campo `imagen`). |
| `PUT` | `/:id` | admin | Actualiza producto (multipart, campo `imagen` opcional). |
| `DELETE` | `/:id` | admin | Elimina producto. |

### Pedidos (`/api/orders`)

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `POST` | `/` | cliente | Crea un pedido a partir del carrito. |
| `GET` | `/mis-pedidos` | cliente | Pedidos propios del cliente. |
| `GET` | `/pendientes` | cocina, admin | Pedidos en estado `pendiente`. |
| `GET` | `/listos` | repartidor, admin | Pedidos en estado `listo` (para reparto). |
| `GET` | `/mis-repartos` | repartidor, admin | Pedidos asignados al repartidor (incluye entregados). |
| `GET` | `/` | admin, cocina | Todos los pedidos. |
| `GET` | `/:id` | admin, cocina, repartidor | Un pedido por id. |
| `GET` | `/:id/factura` | cliente, admin, cocina, repartidor | Factura PDF (binario). |
| `PATCH` | `/:id/estado` | admin, cocina, repartidor | Cambia el estado del pedido. |
| `PATCH` | `/:id/asignar-repartidor` | repartidor | Autoasignación al pedido. |

### Upload (`/api/upload`)

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `POST` | `/` | admin | Sube una imagen a Cloudinary (multipart, campo `imagen`). Devuelve `{ imagen_url, public_id }`. |

### Health (`/api/health`)

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/health` | público | Comprobación rápida de que el backend responde. |

---

## Decisiones técnicas

- **Server-state vs client-state**. TanStack Query gestiona todo lo que viene del backend (pedidos, productos, categorías) con caché, `refetchInterval` y `placeholderData` para evitar parpadeos al remontar componentes. Zustand sólo guarda lo realmente local: token y usuario, carrito, ids de pedidos asignados al repartidor, estado de UI (sidebar, etc.).
- **Optimistic updates** en mutaciones críticas (`asignar-repartidor`, `actualizar-estado`) usando `setQueriesData` para que la UI reaccione antes del round-trip.
- **Persistencia selectiva en sessionStorage**. La pestaña activa del repartidor se persiste para que volver desde el logo del navbar no resetee el contador a cero.
- **Factura en streaming**. PDFKit produce el PDF y se hace `pipe(res)` directamente, sin escribir a disco. Headers `Content-Type: application/pdf` + `Content-Disposition: attachment; filename="..."`. En frontend, axios pide el blob (`responseType: "blob"`) y se dispara la descarga con un `<a download>` temporal.
- **Subida de imágenes**. `multer-storage-cloudinary` transmite el fichero directo a Cloudinary y devuelve la URL pública + `public_id` (para borrarla después).
- **Mobile-first dual-render**. Las tablas de admin se renderizan como `<table>` (`hidden md:block`) y como cards apiladas (`md:hidden`) en lugar de hacer ingeniería CSS para colapsarlas.

---

## Posibles mejoras

- Integración real de pago con Stripe (las tablas `Pago` y las variables de entorno ya están preparadas).
- Notificaciones en tiempo real (WebSockets / Server-Sent Events) para que cocina y repartidor no dependan del polling.
- Persistencia de la factura: guardar el PDF en Cloudinary o en un bucket S3 y rellenar `Factura.pdf_url` para no regenerarlo en cada descarga.
- Tests automáticos (Vitest + Supertest en backend, Vitest + Testing Library en frontend).
- Panel de métricas (ventas por día, ticket medio, productos top).
- Panel para camarero(tomar comandas,etc...)

---
