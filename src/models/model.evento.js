const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  ubicacion: {
    latitud: {
      type: Number,
      required: [true, 'La latitud es obligatoria']
    },
    longitud: {
      type: Number,
      required: [true, 'La longitud es obligatoria']
    }
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria']
  },
  horaInicio: {
    type: Date,
    required: [true, 'La hora de inicio es obligatoria']
  },
  horaFinal: {
    type: Date,
    required: [true, 'La hora de finalización es obligatoria']
  },
  rangoPermitido: {
    type: Number,
    default: 100,
    min: [0, 'El rango permitido no puede ser negativo']
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El creador del evento es obligatorio']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Evento', eventoSchema);
