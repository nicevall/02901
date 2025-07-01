const Evento = require('../models/model.evento');
const Asistencia = require('../models/asistencia.model');
const { incrementMetric } = require("../utils/dashboard.metrics");

exports.registrarAsistencia = async (req, res) => {
  const { eventoId, latitud, longitud } = req.body;
  const estudianteId = req.user.id;

  try {
    // Buscar evento
    const evento = await Evento.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    // Verificar si ya registró asistencia
    const asistenciaExistente = await Asistencia.findOne({
      estudiante: estudianteId,
      evento: eventoId,
    });

    if (asistenciaExistente) {
      return res.status(400).json({
        mensaje: 'El estudiante ya registró asistencia para este evento',
      });
    }

    // Calcular distancia
    const distancia = calcularDistancia(
      evento.ubicacion.latitud,
      evento.ubicacion.longitud,
      latitud,
      longitud
    );
    const dentroDelRango = distancia <= evento.rangoPermitido;

    // Lógica de estado según hora y rango
    const ahora = Date.now();
    const inicioEvento = new Date(evento.horaInicio).getTime(); // <== CORREGIDO

    let estado = 'Ausente';
    if (dentroDelRango) {
      estado = 'Presente';
    } else {
      const diferencia = ahora - inicioEvento;
      if (diferencia >= 0 && diferencia <= 10 * 60 * 1000) {
        estado = 'Pendiente';
      } else if (diferencia < 0) {
        estado = 'Pendiente';
      }
    }

    // Guardar asistencia
    const asistencia = new Asistencia({
      estudiante: estudianteId,
      evento: eventoId,
      coordenadas: { latitud, longitud },
      dentroDelRango,
      Estado: estado
    });

    await asistencia.save();
    await incrementMetric("asistencias");

    // Responder
    res.status(201).json({
      mensaje: estado === 'Presente'
        ? 'Asistencia registrada correctamente'
        : estado === 'Pendiente'
        ? 'Estás fuera del área, tienes 10 minutos para ingresar y registrar tu asistencia'
        : 'Estás fuera del rango y fuera de tiempo, asistencia marcada como Ausente',
      asistencia
    });

  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar asistencia', error: err.message });
  }
};

// Fórmula Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
