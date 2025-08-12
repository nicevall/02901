require('dotenv').config(); // ✅ Cargar variables de entorno primero
const createError = require('http-errors');
const connectDB = require('./src/config/db');
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// Rutas API
const eventoRoutes = require('./src/routes/eventos.routes');
const usuarioRoutes = require('./src/routes/usuarios.routes');
const asistenciaRoutes = require('./src/routes/asistencia.routes');
const locationRoutes = require('./src/routes/location.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const justificacionRoutes = require('./src/routes/justificaciones.routes');
const testRoutes = require('./src/routes/test.routes');

require('./src/cron/asistenciaCron');

const { initWebSocket } = require('./src/config/websocket');


const swaggerUi = require('swagger-ui-express');
const SwaggerDocumentation = require('./swagger_output.json');




const app = express();

// Configurar puerto
const port = normalizePort(process.env.PORT || '80');
app.set('port', port);


// Configuración CORS
app.use(cors());


// 🔌 Conectar a MongoDB

// Conexión a DB
connectDB();



// No se utilizan vistas, se responde siempre en formato JSON

// Middlewares generales
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📌 Rutas API
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/justificaciones', justificacionRoutes);
app.use('/api', testRoutes);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(SwaggerDocumentation));


console.log(app._router.stack);

// Capturar 404
app.use((req, res, next) => {
  next(createError(404));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.info('❌ Error:', err.message);

  res.status(err.status || 500);

  // Respuesta en JSON para cualquier ruta
  res.json({
    error: err.message || 'Error interno del servidor'
  });
});

// Crear servidor y escuchar
const server = http.createServer(app);
initWebSocket(server);
server.listen(port, () => {
  console.info(`🚀 Servidor escuchando en http://localhost:${port}`);
});
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {

  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requiere privilegios elevados');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' ya está en uso');
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.info('Escuchando en ' + bind);
}

module.exports = app;
