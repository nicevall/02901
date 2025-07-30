const Dashboard = require('../models/dashboard.model');
const { broadcast } = require('../config/websocket');
const EventMetric = require('../models/eventMetric.model');

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
