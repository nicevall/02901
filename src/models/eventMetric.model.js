const mongoose = require('mongoose');

const eventMetricSchema = new mongoose.Schema({
  evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true, unique: true },
  dentroDelRango: { type: Number, default: 0 },
  fueraDelRango: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('EventMetric', eventMetricSchema);
