const mysql = require('mysql2');
require('dotenv').config();  // Cargar variables de entorno desde el archivo .env

// Configuración de la conexión a la base de datos usando variables de entorno
const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});


// Conectar a la base de datos
conexion.connect(function(error) {
  if (error) {
    console.error('Error conectando a la base de datos:', error.stack);
    return;
  }
  console.log('Conectado a la base de datos con id ' + conexion.threadId);
});

// Exportar la conexión para su uso en otros módulos
module.exports = conexion;
