const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  rol: {
    type: String,
    enum: ['estudiante', 'docente', 'admin'],
    default: 'estudiante',
  },
  codigoVerificacion: { type: String, required: true },
  expiresAt: {
    type: Date,
    default: Date.now,
    index: { expires: '1h' },
  },
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
