const Dashboard = require('../models/dashboard.model');
const { broadcast } = require('../config/websocket');
const EventMetric = require('../models/eventMetric.model');
const Evento = require('../models/model.evento');
const Asistencia = require('../models/asistencia.model');

exports.getMetrics = async (req, res) => {
  try {
    const metrics = await Dashboard.find().lean();
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener metricas', message: err.message });
  }
};

exports.updateMetric = async (req, res) => {
  const { metric, value } = req.body;
  if (!metric || value === undefined) {
    return res.status(400).json({ error: 'metric y value son requeridos' });
  }
  try {
    const data = await Dashboard.findOneAndUpdate(
      { metric },
      { value },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    broadcast({ type: 'metric-update', data });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar metrica', message: err.message });
  }
};

exports.getEventMetrics = async (req, res) => {
  try {
    const metrics = await EventMetric.findOne({ evento: req.params.id }).lean();
    res.json(metrics || {});
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener metricas de evento', message: err.message });
  }
};

exports.getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(startOfMonth);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    const prevMonthEnd = new Date(startOfMonth.getTime() - 1);

    const [totalEventos, eventosMes, eventosPrevMes, eventosActivos, totalAsistencias] = await Promise.all([
      Evento.countDocuments(),
      Evento.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Evento.countDocuments({ createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } }),
      Evento.countDocuments({ estado: 'activo' }),
      Asistencia.countDocuments()
    ]);

    const cambioEventosMes = eventosPrevMes ? ((eventosMes - eventosPrevMes) * 100) / eventosPrevMes : null;

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = (day + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const prevWeekStart = new Date(startOfWeek);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(startOfWeek.getTime() - 1);

    const [asistenciasSemana, asistenciasSemanaPrev] = await Promise.all([
      Asistencia.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Asistencia.countDocuments({ createdAt: { $gte: prevWeekStart, $lte: prevWeekEnd } })
    ]);

    const cambioAsistenciasSemana = asistenciasSemanaPrev ? ((asistenciasSemana - asistenciasSemanaPrev) * 100) / asistenciasSemanaPrev : null;

    const promedioAgg = await Asistencia.aggregate([
      { $group: { _id: '$evento', total: { $sum: 1 } } },
      { $lookup: { from: 'eventos', localField: '_id', foreignField: '_id', as: 'evento' } },
      { $unwind: '$evento' },
      { $project: { porcentaje: { $cond: [ { $gt: ['$evento.capacidadMaxima', 0] }, { $divide: ['$total', '$evento.capacidadMaxima'] }, null ] } } },
      { $match: { porcentaje: { $ne: null } } }
    ]);

    const promedioAsistenciaPorcentaje = promedioAgg.length ? (promedioAgg.reduce((acc, v) => acc + v.porcentaje, 0) / promedioAgg.length) * 100 : 0;

    const tipoAgg = await Evento.aggregate([
      { $group: { _id: '$tipo', total: { $sum: 1 } } }
    ]);
    const eventosPorTipo = tipoAgg.map(t => ({ tipo: t._id, porcentaje: totalEventos ? (t.total * 100) / totalEventos : 0 }));

    const tendenciaAgg = await Asistencia.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const tendenciaAsistenciaMensual = tendenciaAgg.map(m => ({ mes: m._id, total: m.total }));

    const diasSemanaAgg = await Asistencia.aggregate([
      { $group: { _id: { $dayOfWeek: '$createdAt' }, total: { $sum: 1 } } }
    ]);
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const asistenciaPorDia = diasSemanaAgg.map(d => ({ dia: dias[d._id - 1], total: d.total }));

    const horaAgg = await Asistencia.aggregate([
      { $group: { _id: { $hour: '$createdAt' }, total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const asistenciaPorHora = horaAgg.map(h => ({ hora: h._id, total: h.total }));

    const actividadReciente = await Evento.find({ estado: 'activo' }, 'nombre fechaInicio fechaFin createdAt').sort({ createdAt: -1 }).lean();

    res.json({
      totalEventos,
      cambioEventosMes,
      eventosActivos,
      totalAsistentes: totalAsistencias,
      cambioAsistenciasSemana,
      promedioAsistenciaPorcentaje,
      eventosPorTipo,
      tendenciaAsistenciaMensual,
      asistenciaPorDia,
      asistenciaPorHora,
      actividadReciente
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estadisticas', message: err.message });
  }
};
