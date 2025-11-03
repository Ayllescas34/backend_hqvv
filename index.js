const express = require('express');
const cors = require('cors');
const app = express();
const port = 3002;

// Middleware para permitir CORS (peticiones desde el front)
app.use(cors());

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Rutas para huéspedes
const huespedesRoutes = require('./routes/huespedes');
app.use('/api/huespedes', huespedesRoutes);

// Rutas para reservas
const reservasRoutes = require('./routes/reservas');
app.use('/api/reservas', reservasRoutes);

// Rutas para habitaciones
const habitacionesRoutes = require('./routes/habitaciones');
app.use('/api/habitaciones', habitacionesRoutes);

// Rutas para reservas-habitaciones
const reservasHabitacionesRoutes = require('./routes/reservas_habitaciones');
app.use('/api/reservas-habitaciones', reservasHabitacionesRoutes);

// Rutas para reportes
const reportesRoutes = require('./routes/reportes');
app.use('/api/reportes', reportesRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
  console.log('asdfs', reservasHabitacionesRoutes);
});
