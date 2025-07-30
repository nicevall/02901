const Justificacion = require('../models/justificacion.model');
const Evento = require('../models/model.evento');

exports.crearJustificacion = async (req, res) => {
  try {
    const { eventoId, motivo, descripcion, documentos } = req.body;
    const estudianteId = req.user.id;

    if (!eventoId || !motivo || !descripcion) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const nueva = new Justificacion({
      estudianteId,
      eventoId,
      motivo,
      descripcion,
      documentos
    });

    await nueva.save();
    res.status(201).json({ mensaje: 'Justificaci\u00f3n creada', justificacion: nueva });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear justificaci\u00f3n', error: error.message });
  }
};

exports.obtenerPendientes = async (req, res) => {
  try {
    const { docenteId } = req.params;
    const justificaciones = await Justificacion.find({ estado: 'pendiente' })
      .populate('estudianteId', 'nombre correo')
      .populate('eventoId', 'nombre creadorId fechaInicio');

    const filtradas = justificaciones.filter(j => j.eventoId.creadorId.toString() === docenteId);
    res.status(200).json(filtradas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener justificaciones', error: error.message });
  }
};

exports.aprobarJustificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const justificacion = await Justificacion.findById(id);
    if (!justificacion) return res.status(404).json({ mensaje: 'Justificaci\u00f3n no encontrada' });

    justificacion.estado = 'aprobada';
    justificacion.fechaRespuesta = new Date();
    justificacion.docenteId = req.user.id;
    justificacion.comentarioDocente = req.body.comentario || '';
    await justificacion.save();

    res.json({ mensaje: 'Justificaci\u00f3n aprobada', justificacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al aprobar justificaci\u00f3n', error: error.message });
  }
};

exports.rechazarJustificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const justificacion = await Justificacion.findById(id);
    if (!justificacion) return res.status(404).json({ mensaje: 'Justificaci\u00f3n no encontrada' });

    justificacion.estado = 'rechazada';
    justificacion.fechaRespuesta = new Date();
    justificacion.docenteId = req.user.id;
    justificacion.comentarioDocente = req.body.comentario || '';
    await justificacion.save();

    res.json({ mensaje: 'Justificaci\u00f3n rechazada', justificacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al rechazar justificaci\u00f3n', error: error.message });
  }
};

exports.obtenerPorEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const justificaciones = await Justificacion.find({ estudianteId: id })
      .populate('eventoId', 'nombre fechaInicio');
    res.status(200).json(justificaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener justificaciones', error: error.message });
  }
};

exports.subirDocumento = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: 'No se proporcion\u00f3 archivo' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.status(200).json({ url });
};

exports.historialEvento = async (req, res) => {
  try {
    const { eventoId } = req.params;
    const justificaciones = await Justificacion.find({ eventoId })
      .populate('estudianteId', 'nombre correo')
      .sort({ fechaSolicitud: -1 });
    res.status(200).json(justificaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener historial', error: error.message });
  }
};
