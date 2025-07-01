let wss;
const logger = require('./logger');

function initWebSocket(server) {
  const WebSocket = require('ws');
  wss = new WebSocket.Server({ server });
  logger.info('🧩 WebSocket server iniciado');
}

function broadcast(data) {
  if (!wss) return;
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(msg);
    }
  });
}

module.exports = { initWebSocket, broadcast };
