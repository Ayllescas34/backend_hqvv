const express = require('express');
const router = express.Router();
const db = require('../db');

// A. Cantidad de huéspedes entre fechas
router.get('/huespedes-entre-fechas', async (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = `
    SELECT COUNT(DISTINCT r.id_huesped) AS total_huespedes
    FROM Reservas r
    WHERE r.fecha_ingreso BETWEEN ? AND ?
  `;
  try {
    const [results] = await db.query(sql, [startDate, endDate]);
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// B. Lista de huéspedes entre fechas
router.get('/lista-huespedes-entre-fechas', async (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = `
    SELECT h.*
    FROM Huespedes h
    JOIN Reservas r ON h.id_huesped = r.id_huesped
    WHERE r.fecha_ingreso BETWEEN ? AND ?
  `;
  try {
    const [results] = await db.query(sql, [startDate, endDate]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// C. Huéspedes que cumplen años en mes dado
router.get('/cumpleanios-mes/:mes', async (req, res) => {
  const mes = req.params.mes;
  const sql = `
    SELECT *
    FROM Huespedes
    WHERE MONTH(fecha_nacimiento) = ?
  `;
  try {
    const [results] = await db.query(sql, [mes]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// D. Veces que vino cada huésped (todos los tiempos)
router.get('/veces-que-vino', async (req, res) => {
  const sql = `
    SELECT h.dni, CONCAT(h.primer_nombre, ' ', h.primer_apellido) AS nombre, COUNT(r.id_reserva) AS veces_que_vino
    FROM Huespedes h
    LEFT JOIN Reservas r ON h.id_huesped = r.id_huesped
    GROUP BY h.dni
    ORDER BY veces_que_vino DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// E. Veces que vino cada huésped en rango de fechas
router.get('/veces-que-vino-entre-fechas', async (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = `
    SELECT h.dni, CONCAT(h.primer_nombre, ' ', h.primer_apellido) AS nombre, COUNT(r.id_reserva) AS veces_que_vino
    FROM Huespedes h
    LEFT JOIN Reservas r ON h.id_huesped = r.id_huesped
    WHERE r.fecha_ingreso BETWEEN ? AND ?
    GROUP BY h.dni
    ORDER BY veces_que_vino DESC
  `;
  try {
    const [results] = await db.query(sql, [startDate, endDate]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// F. Cantidad por tipo de contacto
router.get('/cantidad-por-contacto', async (req, res) => {
  const sql = `SELECT tipo_contacto, COUNT(*) AS cantidad FROM Reservas GROUP BY tipo_contacto`;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// G. Cantidad por tipo de pago
router.get('/cantidad-por-pago', async (req, res) => {
  const sql = `SELECT tipo_pago, COUNT(*) AS cantidad FROM Reservas GROUP BY tipo_pago`;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// H. Promedio de noches por huésped
router.get('/promedio-noches-por-huesped', async (req, res) => {
  const sql = `
    SELECT h.dni, CONCAT(h.primer_nombre, ' ', h.primer_apellido) AS nombre, AVG(r.total_noches) AS promedio_noches
    FROM Huespedes h
    LEFT JOIN Reservas r ON h.id_huesped = r.id_huesped
    GROUP BY h.dni
    ORDER BY promedio_noches DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// I. Total de noches ocupadas en un rango de fechas
router.get('/total-noches-entre-fechas', async (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = `SELECT SUM(r.total_noches) AS noches_ocupadas FROM Reservas r WHERE r.fecha_ingreso BETWEEN ? AND ?`;
  try {
    const [results] = await db.query(sql, [startDate, endDate]);
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// J. Cantidad de huéspedes por mes
router.get('/huespedes-por-mes', async (req, res) => {
  const sql = `
    SELECT YEAR(r.fecha_ingreso) AS anio, MONTH(r.fecha_ingreso) AS mes, COUNT(DISTINCT h.id_huesped) AS cantidad
    FROM Reservas r
    JOIN Huespedes h ON r.id_huesped = h.id_huesped
    GROUP BY anio, mes
    ORDER BY anio, mes
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// K. Huéspedes con estancias largas (>5 noches)
router.get('/estancias-largas', async (req, res) => {
  const sql = `
    SELECT h.dni, CONCAT(h.primer_nombre, ' ', h.primer_apellido) AS nombre, r.total_noches
    FROM Huespedes h
    JOIN Reservas r ON h.id_huesped = r.id_huesped
    WHERE r.total_noches > 5
    ORDER BY r.total_noches DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// L. Distribución de tipos de pago por mes
router.get('/pago-por-mes', async (req, res) => {
  const sql = `
    SELECT YEAR(r.fecha_ingreso) AS anio, MONTH(r.fecha_ingreso) AS mes, r.tipo_pago, COUNT(*) AS cantidad
    FROM Reservas r
    GROUP BY anio, mes, r.tipo_pago
    ORDER BY anio, mes, r.tipo_pago
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// M1. Cantidad de veces que se usó cada habitación (SIN filtro de fecha)
router.get('/habitacion-uso', async (req, res) => {
  const sql = `
    SELECT hab.nombre AS habitacion, COUNT(*) AS veces_usada
    FROM Reservas_Habitaciones rh
    JOIN Habitaciones hab ON hab.id_habitacion = rh.id_habitacion
    GROUP BY hab.nombre
    ORDER BY veces_usada DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// M1. Cantidad de veces que se usó cada habitación (CON filtro por rango de fecha)
router.get('/habitacion-uso-entre-fechas', async (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = `
    SELECT hab.nombre AS habitacion, COUNT(*) AS veces_usada
    FROM Reservas_Habitaciones rh
    JOIN Habitaciones hab ON hab.id_habitacion = rh.id_habitacion
    JOIN Reservas r ON r.id_reserva = rh.id_reserva
    WHERE r.fecha_ingreso BETWEEN ? AND ?
    GROUP BY hab.nombre
    ORDER BY veces_usada DESC
  `;
  try {
    const [results] = await db.query(sql, [startDate, endDate]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// M2. Total de noches por habitación (SIN filtro de fecha)
router.get('/habitacion-noches', async (req, res) => {
  const sql = `
    SELECT hab.nombre AS habitacion, SUM(r.total_noches) AS noches_ocupadas
    FROM Reservas r
    JOIN Reservas_Habitaciones rh ON r.id_reserva = rh.id_reserva
    JOIN Habitaciones hab ON hab.id_habitacion = rh.id_habitacion
    GROUP BY hab.nombre
    ORDER BY noches_ocupadas DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// M2. Total de noches por habitación (CON filtro por rango de fecha)
router.get('/habitacion-noches-entre-fechas', async (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = `
    SELECT hab.nombre AS habitacion, SUM(r.total_noches) AS noches_ocupadas
    FROM Reservas r
    JOIN Reservas_Habitaciones rh ON r.id_reserva = rh.id_reserva
    JOIN Habitaciones hab ON hab.id_habitacion = rh.id_habitacion
    WHERE r.fecha_ingreso BETWEEN ? AND ?
    GROUP BY hab.nombre
    ORDER BY noches_ocupadas DESC
  `;
  try {
    const [results] = await db.query(sql, [startDate, endDate]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// N1. Ingresos totales por día
router.get('/ingresos-dia', async (req, res) => {
  const sql = `
    SELECT fecha_ingreso AS fecha, SUM(totalPagado) AS ingresos_diarios
    FROM Reservas
    GROUP BY fecha
    ORDER BY fecha
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// N2. Ingresos totales por semana ISO
router.get('/ingresos-semana', async (req, res) => {
  const sql = `
    SELECT YEAR(fecha_ingreso) AS anio, WEEK(fecha_ingreso, 1) AS semana_iso, SUM(totalPagado) AS ingresos_semanales
    FROM Reservas
    GROUP BY anio, semana_iso
    ORDER BY anio, semana_iso
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// N3. Ingresos totales por mes
router.get('/ingresos-mes', async (req, res) => {
  const sql = `
    SELECT YEAR(fecha_ingreso) AS anio, MONTH(fecha_ingreso) AS mes, SUM(totalPagado) AS ingresos_mensuales
    FROM Reservas
    GROUP BY anio, mes
    ORDER BY anio, mes
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// N3.1 Ingresos totales por mes (con rango de fechas)
router.get('/ingresos-mes-entre-fechas', async (req, res) => {
  const { startDate, endDate } = req.query;
  const sql = `
    SELECT YEAR(fecha_ingreso) AS anio, MONTH(fecha_ingreso) AS mes, SUM(totalPagado) AS ingresos_mensuales
    FROM Reservas
    WHERE fecha_ingreso BETWEEN ? AND ?
    GROUP BY anio, mes
    ORDER BY anio, mes
  `;
  try {
    const [results] = await db.query(sql, [startDate, endDate]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5️⃣ CONSULTAS ESPECIALES
// Perfil de huésped con histórico de visitas
router.get('/perfil-huesped', async (req, res) => {
  const sql = `
    SELECT h.dni, CONCAT(h.primer_nombre, ' ', h.primer_apellido) AS nombre,
      COUNT(r.id_reserva) AS visitas, SUM(r.total_noches) AS total_noches, SUM(r.totalPagado) AS total_gastado
    FROM Huespedes h
    LEFT JOIN Reservas r ON h.id_huesped = r.id_huesped
    GROUP BY h.dni
    ORDER BY visitas DESC, total_gastado DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ocupación promedio de habitaciones por mes
router.get('/ocupacion-habitacion-mes', async (req, res) => {
  const sql = `
    SELECT hab.nombre AS habitacion, YEAR(r.fecha_ingreso) AS anio, MONTH(r.fecha_ingreso) AS mes,
      COUNT(rh.id_habitacion) AS veces_utilizada, (COUNT(rh.id_habitacion) / 30.0) * 100 AS porcentaje_ocupacion_aprox
    FROM Reservas r
    JOIN Reservas_Habitaciones rh ON r.id_reserva = rh.id_reserva
    JOIN Habitaciones hab ON hab.id_habitacion = rh.id_habitacion
    GROUP BY hab.nombre, anio, mes
    ORDER BY anio, mes, hab.nombre
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Temporada Alta y Baja
router.get('/temporada', async (req, res) => {
  const sql = `
    SELECT YEAR(r.fecha_ingreso) AS anio, MONTH(r.fecha_ingreso) AS mes,
      COUNT(r.id_reserva) AS total_reservas, SUM(r.totalPagado) AS ingresos_totales
    FROM Reservas r
    GROUP BY anio, mes
    ORDER BY total_reservas DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tipos de pago preferidos por periodo
router.get('/pago-preferido-periodo', async (req, res) => {
  const sql = `
    SELECT YEAR(r.fecha_ingreso) AS anio, MONTH(r.fecha_ingreso) AS mes, r.tipo_pago,
      COUNT(r.id_reserva) AS total_veces, SUM(r.totalPagado) AS total_ingresos
    FROM Reservas r
    GROUP BY anio, mes, r.tipo_pago
    ORDER BY anio, mes, total_veces DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Análisis de huéspedes frecuentes (3 o más visitas)
router.get('/huespedes-frecuentes', async (req, res) => {
  const sql = `
    SELECT h.dni, CONCAT(h.primer_nombre, ' ', h.primer_apellido) AS nombre, COUNT(r.id_reserva) AS visitas
    FROM Huespedes h
    LEFT JOIN Reservas r ON h.id_huesped = r.id_huesped
    GROUP BY h.dni
    HAVING visitas >= 3
    ORDER BY visitas DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Duración promedio de estadía por habitación
router.get('/promedio-noches-habitacion', async (req, res) => {
  const sql = `
    SELECT hab.nombre AS habitacion, AVG(r.total_noches) AS promedio_noches
    FROM Reservas r
    JOIN Reservas_Habitaciones rh ON r.id_reserva = rh.id_reserva
    JOIN Habitaciones hab ON hab.id_habitacion = rh.id_habitacion
    GROUP BY hab.nombre
    ORDER BY promedio_noches DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Huéspedes por país
router.get('/huespedes-por-pais', async (req, res) => {
  const sql = `
    SELECT h.pais, COUNT(*) AS cantidad
    FROM Huespedes h
    JOIN Reservas r ON h.id_huesped = r.id_huesped
    GROUP BY h.pais
    ORDER BY cantidad DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Días de la semana con más ingresos
router.get('/ingresos-por-dia-semana', async (req, res) => {
  const sql = `
    SELECT DAYNAME(r.fecha_ingreso) AS dia_semana, SUM(r.totalPagado) AS ingresos
    FROM Reservas r
    GROUP BY dia_semana
    ORDER BY ingresos DESC
  `;
  try {
    const [results] = await db.query(sql);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
