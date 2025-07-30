const mongoose = require('mongoose');

const JustificacionSchema = new mongoose.Schema({
  estudianteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  eventoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true },
  motivo: { type: String, required: true },
  descripcion: { type: String, required: true },
  documentos: [String],
  fechaSolicitud: { type: Date, default: Date.now },
  estado: { type: String, enum: ['pendiente', 'aprobada', 'rechazada'], default: 'pendiente' },
  fechaRespuesta: Date,
  comentarioDocente: String,
  docenteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
}, { timestamps: true });

module.exports = mongoose.model('Justificacion', JustificacionSchema);
