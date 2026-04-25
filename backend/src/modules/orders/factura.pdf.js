// Generador de factura/recibo en PDF para un pedido entregado.
// Stream-based: el controller lo "pipea" directo al `res`, sin escribir
// nada en disco. Estructura basada en una factura simplificada española
// (RD 1619/2012): emisor, receptor, número, fecha, descripción, base
// imponible, tipo y cuota de IVA, y total.
import PDFDocument from "pdfkit";

const COLOR_PRIMARY = "#ea580c"; // orange-600
const COLOR_DARK = "#78350f"; // amber-900
const COLOR_MUTED = "#9a8270";

// Datos fiscales del emisor (PideON). Si en el futuro se mueven a la BD o a
// variables de entorno, basta con cambiarlos aquí.
const EMISOR = {
  nombre: "PideON S.L.",
  nif: "B-00000000",
  direccion: "C/ Triana, 1",
  cp_ciudad: "35002 Las Palmas de Gran Canaria",
  email: "facturacion@pideon.es",
};

// IGIC aplicado en hostelería en Canarias: 7% (tipo general).
// Se asume que los precios almacenados en el pedido son PVP (impuesto
// incluido), por lo que desglosamos la base imponible hacia atrás.
const TIPO_IMPUESTO = 0.07;
const NOMBRE_IMPUESTO = "IGIC";

const formatPrecio = (v) => `${Number(v || 0).toFixed(2)} EUR`;

const formatFecha = (d) =>
  new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// Número de factura tipo "F-2026-000123": año + id rellenado.
const numeroFactura = (pedido) => {
  const fecha = new Date(pedido.created_at || Date.now());
  const año = fecha.getFullYear();
  const id = String(pedido.id).padStart(6, "0");
  return `F-${año}-${id}`;
};

/**
 * Pipea el PDF de la factura al response Express.
 * @param {object} pedido - El pedido con líneas y usuario incluidos.
 * @param {object} res - El objeto Response de Express.
 */
export const streamFacturaPedido = (pedido, res) => {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `Factura PideON ${numeroFactura(pedido)}`,
      Author: EMISOR.nombre,
      Subject: `Factura del pedido ${pedido.id}`,
    },
  });

  doc.pipe(res);

  // ───────────── Cabecera ─────────────
  doc
    .fillColor(COLOR_PRIMARY)
    .fontSize(28)
    .font("Helvetica-Bold")
    .text("PideON", 50, 50);

  doc
    .fillColor(COLOR_MUTED)
    .fontSize(9)
    .font("Helvetica")
    .text(EMISOR.nombre, 50, 82)
    .text(`NIF: ${EMISOR.nif}`, 50, 94)
    .text(EMISOR.direccion, 50, 106)
    .text(EMISOR.cp_ciudad, 50, 118);

  // Bloque "Factura nº ..." a la derecha
  doc
    .fillColor(COLOR_DARK)
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("FACTURA", 0, 50, { align: "right" });

  doc
    .fillColor("#000")
    .fontSize(10)
    .font("Helvetica")
    .text(`Nº ${numeroFactura(pedido)}`, 0, 76, { align: "right" })
    .text(`Fecha: ${formatFecha(pedido.created_at)}`, 0, 90, {
      align: "right",
    });

  // Línea separadora
  doc
    .strokeColor(COLOR_PRIMARY)
    .lineWidth(2)
    .moveTo(50, 140)
    .lineTo(545, 140)
    .stroke();

  // ───────────── Datos del cliente ─────────────
  let y = 160;

  doc
    .fillColor(COLOR_DARK)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Cliente", 50, y);

  y += 18;

  const usuario = pedido.usuario || {};
  doc
    .fillColor("#000")
    .fontSize(11)
    .font("Helvetica")
    .text(
      `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim() || "—",
      50,
      y
    );
  y += 14;
  if (usuario.email) {
    doc.text(usuario.email, 50, y);
    y += 14;
  }
  if (pedido.telefono) {
    doc.text(`Tel.: ${pedido.telefono}`, 50, y);
    y += 14;
  }

  // ───────────── Datos de entrega ─────────────
  doc
    .fillColor(COLOR_DARK)
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("Entrega", 320, 160);

  let y2 = 178;
  doc.fillColor("#000").fontSize(11).font("Helvetica");

  if (pedido.tipo_entrega === "domicilio") {
    const linea1 = `${pedido.entrega_calle || ""} ${pedido.entrega_numero || ""}`.trim();
    const piso = pedido.entrega_piso ? `, ${pedido.entrega_piso}` : "";
    const linea2 = `${pedido.entrega_cp || ""} ${pedido.entrega_ciudad || ""}`.trim();
    if (linea1) {
      doc.text(linea1 + piso, 320, y2);
      y2 += 14;
    }
    if (linea2) {
      doc.text(linea2, 320, y2);
      y2 += 14;
    }
  } else if (pedido.tipo_entrega === "recogida") {
    doc.text("Recogida en local", 320, y2);
    y2 += 14;
  }

  // El cursor baja al máximo entre las dos columnas
  y = Math.max(y, y2) + 10;

  // ───────────── Tabla de líneas ─────────────
  const tableTop = y + 10;
  const tableLeft = 50;
  const tableRight = 545;
  const colCantidad = tableLeft + 10;
  const colDescripcion = tableLeft + 60;
  const colPrecio = tableRight - 180;
  const colSubtotal = tableRight - 70;

  // Cabecera de tabla
  doc
    .fillColor(COLOR_PRIMARY)
    .rect(tableLeft, tableTop, tableRight - tableLeft, 22)
    .fill();

  doc
    .fillColor("#fff")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("Cant.", colCantidad, tableTop + 6)
    .text("Descripción", colDescripcion, tableTop + 6)
    .text("P. unit.", colPrecio, tableTop + 6, { width: 80, align: "right" })
    .text("Importe", colSubtotal, tableTop + 6, {
      width: 65,
      align: "right",
    });

  let rowY = tableTop + 28;
  const lineas = pedido.lineas || [];

  doc.fillColor("#000").font("Helvetica").fontSize(11);

  lineas.forEach((l, i) => {
    if (i % 2 === 1) {
      doc
        .fillColor("#fff7ed") // orange-50
        .rect(tableLeft, rowY - 4, tableRight - tableLeft, 22)
        .fill();
    }
    doc.fillColor("#000");

    const nombre =
      l.producto?.nombre || `Producto #${l.producto_id || "?"}`;
    const precioUnit = Number(l.precio_unitario || 0);
    const subtotal = precioUnit * (l.cantidad || 0);

    doc.text(String(l.cantidad ?? 0), colCantidad, rowY);
    doc.text(nombre, colDescripcion, rowY, {
      width: colPrecio - colDescripcion - 10,
    });
    doc.text(formatPrecio(precioUnit), colPrecio, rowY, {
      width: 80,
      align: "right",
    });
    doc.text(formatPrecio(subtotal), colSubtotal, rowY, {
      width: 65,
      align: "right",
    });

    rowY += 22;
  });

  if (lineas.length === 0) {
    doc
      .fillColor(COLOR_MUTED)
      .text("(Sin líneas en este pedido)", tableLeft + 10, rowY);
    rowY += 22;
  }

  // ───────────── Totales (con desglose de IVA) ─────────────
  rowY += 10;
  doc
    .strokeColor("#fed7aa") // orange-200
    .lineWidth(1)
    .moveTo(colPrecio, rowY)
    .lineTo(tableRight, rowY)
    .stroke();

  rowY += 8;

  // Importe bruto de las líneas (PVP, IVA incluido).
  const importeLineas = lineas.reduce(
    (acc, l) => acc + Number(l.precio_unitario || 0) * (l.cantidad || 0),
    0
  );
  const descuento = Number(pedido.descuento_aplicado || 0);
  const totalConIva = Number(
    pedido.total != null ? pedido.total : importeLineas - descuento
  );

  // Desglose: precios almacenados ya llevan el impuesto, extraemos la base.
  const baseImponible = totalConIva / (1 + TIPO_IMPUESTO);
  const cuotaImpuesto = totalConIva - baseImponible;

  doc
    .fillColor("#000")
    .font("Helvetica")
    .fontSize(11)
    .text("Base imponible", colPrecio, rowY, { width: 80, align: "right" })
    .text(formatPrecio(baseImponible), colSubtotal, rowY, {
      width: 65,
      align: "right",
    });
  rowY += 18;

  if (descuento > 0) {
    doc
      .fillColor("#000")
      .text("Descuento", colPrecio, rowY, { width: 80, align: "right" })
      .text(`- ${formatPrecio(descuento)}`, colSubtotal, rowY, {
        width: 65,
        align: "right",
      });
    rowY += 18;
  }

  doc
    .fillColor("#000")
    .text(
      `${NOMBRE_IMPUESTO} (${(TIPO_IMPUESTO * 100).toFixed(0)} %)`,
      colPrecio,
      rowY,
      { width: 80, align: "right" }
    )
    .text(formatPrecio(cuotaImpuesto), colSubtotal, rowY, {
      width: 65,
      align: "right",
    });
  rowY += 22;

  doc
    .fillColor(COLOR_DARK)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("TOTAL", colPrecio, rowY, { width: 80, align: "right" })
    .text(formatPrecio(totalConIva), colSubtotal, rowY, {
      width: 65,
      align: "right",
    });

  // ───────────── Pie de página ─────────────
  doc
    .fillColor(COLOR_MUTED)
    .fontSize(9)
    .font("Helvetica-Oblique")
    .text(
      `${EMISOR.nombre} · NIF ${EMISOR.nif} · ${EMISOR.email}`,
      50,
      760,
      { align: "center", width: 495 }
    )
    .text(
      "Factura simplificada emitida conforme al RD 1619/2012.",
      50,
      774,
      { align: "center", width: 495 }
    );

  doc.end();
};
