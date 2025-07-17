const Evento = require('../models/model.evento');
const { incrementMetric } = require("../utils/dashboard.metrics");

// Crear un nuevo evento (solo docentes)
exports.crearEvento = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      ubicacion,
      fecha,
      horaInicio,
      horaFinal,
      activo,
      rangoPermitido
    } = req.body;


    // Validación básica
    if (!titulo || !ubicacion?.latitud || !ubicacion?.longitud || !fechaInicio || !fechaFin) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios del evento' });
    }

    const nuevoEvento = new Evento({
      titulo,
      descripcion,
      ubicacion: {
        latitud: parseFloat(ubicacion.latitud),
        longitud: parseFloat(ubicacion.longitud)
      },
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      rangoPermitido: rangoPermitido || 100, // opcional
      creadoPor: req.user.id
    });

    await nuevoEvento.save();
    await incrementMetric("eventos");

    res.status(201).json({
      mensaje: 'Evento creado exitosamente',
      evento: nuevoEvento
    });
  } catch (err) {
    res.status(500).json({
      mensaje: 'Error al crear evento',
      error: err.message,
      stack: err.stack
    });
  }
};


// Obtener todos los eventos
exports.obtenerEventos = async (req, res) => {
  try {
    const eventos = await Evento.find({ activo: true }).populate('creadoPor', 'nombre email rol');
    res.status(200).json(eventos);
  } catch (err) {
    console.error('Error al obtener eventos:', err); // imprime el error completo en consola
    res.status(500).json({
      mensaje: 'Error al obtener eventos',
      error: err.message,
      stack: err.stack, // información detallada para debugging
    });

    }
};

// Obtener evento por ID
exports.obtenerEventoPorId = async (req, res) => {
  try {
    const evento = await Evento.findOne({ _id: req.params.id, activo: true }).populate('creadoPor', 'nombre email');
    if (!evento) return res.status(404).json({ mensaje: 'Evento no encontrado' });
    res.status(200).json(evento);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener el evento', error: err.message });
  }
};

// Actualizar un evento (solo docente creador)
exports.actualizarEvento = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento || !evento.activo) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    // Verificar permisos
    if (evento.creadoPor.toString() !== req.user.id && req.user.rol !== 'admin' && req.user.rol !== 'docente') {
      return res.status(403).json({ mensaje: 'No tienes permiso para modificar este evento' });
    }

    const {
      titulo,
      descripcion,
      ubicacion,
      fechaInicio,
      fechaFin,
      rangoPermitido
    } = req.body;

    // Actualizar solo campos válidos
    if (titulo !== undefined) evento.titulo = titulo;
    if (descripcion !== undefined) evento.descripcion = descripcion;
    if (ubicacion?.latitud !== undefined) evento.ubicacion.latitud = parseFloat(ubicacion.latitud);
    if (ubicacion?.longitud !== undefined) evento.ubicacion.longitud = parseFloat(ubicacion.longitud);
    if (fechaInicio !== undefined) evento.fechaInicio = new Date(fechaInicio);
    if (fechaFin !== undefined) evento.fechaFin = new Date(fechaFin);
    if (rangoPermitido !== undefined) evento.rangoPermitido = parseFloat(rangoPermitido);

    await evento.save();

    res.status(200).json({ mensaje: 'Evento actualizado', evento });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar evento', error: err.message });
  }
};


// Eliminar un evento (solo docente creador o admin)
exports.eliminarEvento = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento || !evento.activo) return res.status(404).json({ mensaje: 'Evento no encontrado' });

    if (evento.creadoPor.toString() !== req.user.id && req.user.rol !== 'admin', 'docente') {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este evento' });
    }

    evento.activo = false;
    await evento.save();
    await incrementMetric("eventos", -1);
    res.status(200).json({ mensaje: 'Evento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar evento', error: err.message });
  }
};
