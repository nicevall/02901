// controllers/locationController.js
const UserLocation = require('../models/model.UserLocation');
const Evento = require('../models/model.evento');
const Asistencia = require('../models/asistencia.model');
const { incrementMetric } = require("../utils/dashboard.metrics");

// Coordenadas del punto central de geocerca
const referenceLat = -0.1807;
const referenceLon = -78.4678;
const GEOFENCE_RADIUS = 100; // en metros

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distancia en metros
}

exports.updateUserLocation = async (req, res) => {
  try {
    const { userId, latitude, longitude, previousState, eventoId } = req.body;

    if (!userId || latitude == null || longitude == null) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    let lat = referenceLat;
    let lon = referenceLon;
    let rango = GEOFENCE_RADIUS;

    if (eventoId) {
      const evento = await Evento.findById(eventoId);
      if (evento) {
        lat = evento.ubicacion.latitud;
        lon = evento.ubicacion.longitud;
        rango = evento.rangoPermitido;
      }
    }

    const distance = calculateDistance(latitude, longitude, lat, lon);
    const insideGeofence = distance <= rango;

    // Solo guarda si hay cambio (ej. entró o salió)
    if (insideGeofence !== previousState) {
      await UserLocation.create({
        userId,
        latitude,
        longitude,
        insideGeofence
      });
      await incrementMetric("locations");
    }

    if (eventoId) {
      const asistencia = await Asistencia.findOne({ estudiante: userId, evento: eventoId });
      if (asistencia) {
        if (!insideGeofence) {
        }
        await asistencia.save();
      }
    }

    return res.json({ insideGeofence, distance });

  } catch (error) {
    console.error('Error actualizando ubicación:', error);
    return res.status(500).json({ error: 'Error del servidor' });
  }
};
