const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const userRoutes = require('./routes/user.routes');
const notificationRoutes = require('./routes/notification.routes');
const categoryRoutes = require('./routes/category.routes');
const uploadRoutes = require('./routes/upload.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const registrationRoutes = require('./routes/registration.routes');

const app = express();

// En desarrollo, si no se define CORS_ORIGIN, se permite cualquier origen
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Sirve las imagenes subidas (fotos de perfil y de actividades)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/registrations', registrationRoutes);

// Ruta no encontrada: respuesta JSON consistente
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Manejador de errores centralizado: traduce cualquier error a una respuesta JSON consistente
// y nunca expone detalles internos de Mongoose/Mongo/JWT al cliente.
app.use((err, _req, res, _next) => {
  let statusCode = err.statusCode;
  let message = err.message;

  if (!statusCode) {
    if (err.name === 'ValidationError') {
      statusCode = 400;
    } else if (err.name === 'CastError') {
      statusCode = 400;
      message = 'El identificador proporcionado no es válido';
    } else if (err.code === 11000) {
      statusCode = 409;
      message = 'El recurso ya existe';
    } else if (err.name === 'MulterError') {
      statusCode = 400;
      message =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'La imagen supera el tamaño permitido (máx. 5MB)'
          : 'Error al subir la imagen';
    } else {
      statusCode = 500;
    }
  }

  if (statusCode === 500) {
    console.error(err);
    message = 'Error interno del servidor';
  }

  res.status(statusCode).json({ success: false, message });
});

module.exports = app;
