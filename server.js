require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const MySQLStore = require('express-mysql-session')(session);

const app = express();
const port = process.env.PORT ;

// Configuración del almacenamiento de sesiones
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos (opcional)

// Configuración del middleware de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi-secreto', // Cadena secreta para firmar la ID de sesión
    resave: false, // No guardar la sesión si no ha sido modificada
    saveUninitialized: true, // Guardar sesiones nuevas no modificadas
    store: sessionStore, // Almacenar sesiones en MySQL
    cookie: {
        //maxAge: 60 * 60 * 1000, // 1 hora
        secure: process.env.NODE_ENV === 'production', // Usa `true` si estás utilizando HTTPS
        httpOnly: true, // Evita acceso desde JavaScript
        sameSite: 'Lax' // Protección contra ataques CSRF
    }
}));

// Importar rutas
const personalRoutes = require('./routes/personalRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const unidadRoutes = require('./routes/unidadRoutes');
const marcaRoutes = require('./routes/marcaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const loguinRoutes = require('./routes/loguinRoutes');
const compraRoutes = require('./routes/compraRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const tableroRoutes = require('./routes/tableroRoutes');


// Usar las rutas
app.use('/api/personal', personalRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/proveedor', proveedorRoutes);
app.use('/api/categoria', categoriaRoutes);
app.use('/api/unidad', unidadRoutes);
app.use('/api/producto', productoRoutes);
app.use('/api/marca', marcaRoutes);
app.use('/api/loguin', loguinRoutes);
app.use('/api/compra', compraRoutes);
app.use('/api/venta', ventaRoutes);
app.use('/api/tablero', tableroRoutes);


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

