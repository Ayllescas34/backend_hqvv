const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las reservas
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Reservas');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear reserva (POST)
router.post('/', async (req, res) => {
  const {
    id_huesped,
    fechaReservacion,
    fechaAnticipo,
    valorAnticipo,
    fecha_ingreso,
    fecha_salida,
    fecha_factura,
    numero_factura,
    totalPagado,
    tipo_contacto,
    tipo_pago
  } = req.body;

  // Calcular saldo_pendiente
  const saldo_pendiente = Number(totalPagado) - Number(valorAnticipo);

  try {
    const [result] = await db.query(
      `INSERT INTO Reservas 
      (id_huesped, fechaReservacion, fechaAnticipo, valorAnticipo, fecha_ingreso, fecha_salida, fecha_factura, numero_factura, totalPagado, tipo_contacto, tipo_pago, saldo_pendiente) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_huesped,
        fechaReservacion,
        fechaAnticipo,
        valorAnticipo,
        fecha_ingreso,
        fecha_salida,
        fecha_factura,
        numero_factura,
        totalPagado,
        tipo_contacto,
        tipo_pago,
        saldo_pendiente
      ]
    );
    res.json({ id_reserva: result.insertId, saldo_pendiente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las reservas con habitaciones asociadas
router.get('/con-habitaciones', async (req, res) => {
  const sql = `
    SELECT r.*, GROUP_CONCAT(hab.nombre SEPARATOR ', ') AS habitaciones
    FROM Reservas r
    LEFT JOIN Reservas_Habitaciones rh ON r.id_reserva = rh.id_reserva
    LEFT JOIN Habitaciones hab ON hab.id_habitacion = rh.id_habitacion
    GROUP BY r.id_reserva
    ORDER BY r.id_reserva DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/pago-complemento', async (req, res) => {
  const { pago_complemento, fecha_pago_complemento } = req.body;
  const { id } = req.params;
  try {
    // 1. Obtener el valorAnticipo actual
    const [rows] = await db.query('SELECT valorAnticipo FROM Reservas WHERE id_reserva = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });

    // Si valorAnticipo es null, lo tratamos como 0
    const valorAnticipoActual = Number(rows[0].valorAnticipo) || 0;
    const pagoComplementoNum = Number(pago_complemento) || 0;

    // Sumar el pago complemento al anticipo
    const nuevoAnticipo = valorAnticipoActual + pagoComplementoNum;

    // Actualizar los campos en la reserva (el trigger calcula saldo_pendiente)
    await db.query(
      `UPDATE Reservas SET pago_complemento = ?, fecha_pago_complemento = ?, valorAnticipo = ? WHERE id_reserva = ?`,
      [pagoComplementoNum, fecha_pago_complemento, nuevoAnticipo, id]
    );

    // Consultar el saldo pendiente actualizado
    const [updated] = await db.query('SELECT saldo_pendiente FROM Reservas WHERE id_reserva = ?', [id]);
    res.json({ message: 'Pago complementario actualizado correctamente', saldo_pendiente: updated[0].saldo_pendiente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;