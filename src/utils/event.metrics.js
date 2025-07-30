const EventMetric = require('../models/eventMetric.model');
const { broadcast } = require('../config/websocket');

async function incrementEventMetric(evento, field, delta = 1) {
  try {
    const update = { $inc: { [field]: delta } };
    const doc = await EventMetric.findOneAndUpdate(
      { evento },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    broadcast({ type: 'event-metric-update', evento: String(evento), data: doc });
    return doc;
  } catch (err) {
    console.error('Failed to increment event metric', field, err);
  }
}

module.exports = { incrementEventMetric };
