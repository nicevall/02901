// models/UserLocation.js
const mongoose = require('mongoose');

const UserLocationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  latitude: Number,
  longitude: Number,
  insideGeofence: Boolean,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserLocation', UserLocationSchema);
  