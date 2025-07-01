const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  metric: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Dashboard', dashboardSchema);
