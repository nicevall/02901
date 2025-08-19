let wss;
const logger = require('./logger');

/**
 * Inicializa el servidor WebSocket y maneja los mensajes de los clientes.
 * Actualmente se utiliza para cambiar el estado de un evento en tiempo real
 * y notificar a todos los clientes conectados cuando dicho estado cambia.
 */
function initWebSocket(server) {
  const WebSocket = require('ws');
  const Evento = require('../models/model.evento');

  wss = new WebSocket.Server({ server });
  logger.info('🧩 WebSocket server iniciado');

  // Escuchar conexiones entrantes
  wss.on('connection', ws => {
    ws.on('message', async msg => {
      try {
        const data = JSON.parse(msg);

        // Manejar cambio de estado de eventos
        if (data.type === 'change-event-status' && data.id && data.estado) {
          const evento = await Evento.findByIdAndUpdate(
            data.id,
            { estado: data.estado },
            { new: true }
          );

          if (evento) {
            broadcast({
              type: 'event-status',
              evento: String(evento._id),
              estado: evento.estado
            });
          }
        }
      } catch (error) {
        logger.error('Error procesando mensaje WS', error);
      }
    });
  });
}

/**
 * Envía un mensaje JSON a todos los clientes conectados.
 */
function broadcast(data) {
  if (!wss) return;
  const msg = JSON.stringify(data);
  const WebSocket = require('ws');
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

module.exports = { initWebSocket, broadcast };
