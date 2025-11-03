const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { id_reserva, id_habitacion } = req.body;
  try {
    await db.query('INSERT INTO Reservas_Habitaciones (id_reserva, id_habitacion) VALUES (?, ?)', [id_reserva, id_habitacion]);
    res.json({ message: 'Habitación asignada a reserva correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;