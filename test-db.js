require('dotenv').config();
const db = require('./db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT * from habitaciones');
    console.log('Conexión exitosa:', rows[2]);
    process.exit(0);
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    process.exit(1);
  }
}

testConnection();
