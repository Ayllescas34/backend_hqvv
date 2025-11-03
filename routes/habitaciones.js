const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las habitaciones
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Habitaciones');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insertar habitación
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  try {
    await db.query('INSERT INTO Habitaciones (nombre) VALUES (?)', [nombre]);
    res.json({ message: 'Habitación agregada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
