const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const huespedesRouter = require('./routes/huespedes');
const habitacionesRouter = require('./routes/habitaciones');
const reservasRouter = require('./routes/reservas');
const reservasHabitacionesRouter = require('./routes/reservas_habitaciones');
const reportesRouter = require('./routes/reportes');

app.use(cors());
app.use(express.json());

app.use('/api/huespedes', huespedesRouter);
app.use('/api/habitaciones', habitacionesRouter);
app.use('/api/reservas', reservasRouter);
app.use('/api/reservas-habitaciones', reservasHabitacionesRouter);
app.use('/api/reportes', reportesRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  
})