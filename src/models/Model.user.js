// models/usuario.model.js
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  correoVerificado: { type: Boolean, default: false },
  codigoVerificacion: { type: String },
  codigoVerificacionExpira: { type: Date },
  rol: {
    type: String,
    enum: ['estudiante', 'docente', 'admin'],
    default: 'estudiante',
  },
  creadoEn: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Usuario', usuarioSchema);
