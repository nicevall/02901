const Dashboard = require('../models/dashboard.model');
const { broadcast } = require('../config/websocket');

async function incrementMetric(metric, delta = 1) {
  try {
    const doc = await Dashboard.findOneAndUpdate(
      { metric },
      { $inc: { value: delta } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    broadcast({ type: 'metric-update', data: doc });
    return doc;
  } catch (err) {
    console.error('Failed to increment metric', metric, err);
  }
}

module.exports = { incrementMetric };
