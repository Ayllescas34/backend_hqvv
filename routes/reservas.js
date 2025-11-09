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
    tipo_pago,
    habitaciones // <-- Recibe el array de habitaciones
  } = req.body;

  const saldo_pendiente = Number(totalPagado) - Number(valorAnticipo);

  try {
    console.log('Datos recibidos en reserva:', req.body);

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
    const id_reserva = result.insertId;
    console.log('Reserva creada con ID:', id_reserva);

    // Guardar habitaciones asociadas
    if (habitaciones && Array.isArray(habitaciones)) {
      console.log('Habitaciones a guardar:', habitaciones);
      for (const id_habitacion of habitaciones) {
        try {
          const insertResult = await db.query(
            'INSERT INTO Reservas_Habitaciones (id_reserva, id_habitacion) VALUES (?, ?)',
            [id_reserva, id_habitacion]
          );
          console.log(`Habitación ${id_habitacion} asociada a reserva ${id_reserva}`, insertResult);
        } catch (err) {
          console.error('Error guardando habitación:', id_habitacion, err.message);
        }
      }
    } else {
      console.log('No se recibieron habitaciones para asociar.');
    }

    res.json({ id_reserva, saldo_pendiente });
  } catch (err) {
    console.error('Error en reserva:', err.message);
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
  const { pago_complemento, fecha_pago_complemento, fecha_factura, numero_factura } = req.body;
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT valorAnticipo, saldo_pendiente FROM Reservas WHERE id_reserva = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });

    const valorAnticipoActual = Number(rows[0].valorAnticipo) || 0;
    const saldoPendienteActual = Number(rows[0].saldo_pendiente) || 0;
    const pagoComplementoNum = Number(pago_complemento) || 0;

    if (pagoComplementoNum > saldoPendienteActual) {
      return res.status(400).json({ error: 'El pago complemento no puede ser mayor al saldo pendiente.' });
    }

    const nuevoAnticipo = valorAnticipoActual + pagoComplementoNum;

    await db.query(
      `UPDATE Reservas SET pago_complemento = ?, fecha_pago_complemento = ?, valorAnticipo = ?, fecha_factura = ?, numero_factura = ? WHERE id_reserva = ?`,
      [pagoComplementoNum, fecha_pago_complemento, nuevoAnticipo, fecha_factura, numero_factura, id]
    );

    const [updated] = await db.query('SELECT saldo_pendiente FROM Reservas WHERE id_reserva = ?', [id]);
    res.json({ message: 'Pago complementario actualizado correctamente', saldo_pendiente: updated[0].saldo_pendiente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;