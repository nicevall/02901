const Dashboard = require('../models/dashboard.model');
const { broadcast } = require('../config/websocket');

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
