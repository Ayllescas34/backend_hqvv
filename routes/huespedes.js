const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const db = require('../db');


// Función para formatear fechas a DD-MM-YYYY
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// --- CRUD Básico ---

// Obtener todos los huéspedes
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Huespedes');
    const formatted = results.map(h => ({
      ...h,
      fecha_nacimiento: formatDate(h.fecha_nacimiento),
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insertar huésped
router.post('/', async (req, res) => {
  const d = req.body;
  const sql = `
    INSERT INTO Huespedes (
      dni, nit, primer_nombre, segundo_nombre, primer_apellido,
      segundo_apellido, apellido_casada, fecha_nacimiento, telefono,
      ciudad, pais
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    d.dni, d.nit, d.primer_nombre, d.segundo_nombre, d.primer_apellido,
    d.segundo_apellido, d.apellido_casada, d.fecha_nacimiento, d.telefono,
    d.ciudad, d.pais
  ];
  try {
    await db.query(sql, values);
    res.json({ message: 'Huésped agregado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar huésped por id
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const d = req.body;
  const sql = `
    UPDATE Huespedes SET
      dni = ?, nit = ?, primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?,
      segundo_apellido = ?, apellido_casada = ?, fecha_nacimiento = ?, telefono = ?,
      ciudad = ?, pais = ?
    WHERE id_huesped = ?
  `;
  const values = [
    d.dni, d.nit, d.primer_nombre, d.segundo_nombre, d.primer_apellido,
    d.segundo_apellido, d.apellido_casada, d.fecha_nacimiento, d.telefono,
    d.ciudad, d.pais, id
  ];
  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Huésped no encontrado' });
    }
    res.json({ message: 'Huésped actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar huésped
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query('DELETE FROM Huespedes WHERE id_huesped = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Huésped no encontrado' });
    }
    res.json({ message: 'Huésped eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar huésped por DNI
router.get('/buscar/:dni', async (req, res) => {
  const dni = req.params.dni;
  try {
    const [results] = await db.query('SELECT * FROM Huespedes WHERE dni = ?', [dni]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Huésped no encontrado' });
    }
    // Formatear fecha_nacimiento si existe
    const formatted = results.map(h => ({
      ...h,
      fecha_nacimiento: formatDate(h.fecha_nacimiento),
    }));
    res.json(formatted[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;