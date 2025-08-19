const cron = require('node-cron');
const Evento = require('../models/model.evento');
const { broadcast } = require('../config/websocket');

/**
 * Determina si un evento ya debería estar en proceso
 * @param {Object} evento - Documento de evento
 * @param {Date} now - Fecha actual
 * @returns {boolean}
 */
function debeIniciarEvento(evento, now = new Date()) {
  if (!evento.fechaInicio || !evento.horaInicio) return false;
  const [hours, minutes] = evento.horaInicio.split(':').map(Number);
  const inicio = new Date(evento.fechaInicio);
  inicio.setHours(hours, minutes, 0, 0);
  return inicio <= now;
}

/**
 * Determina si un evento ya debería finalizar
 * @param {Object} evento - Documento de evento
 * @param {Date} now - Fecha actual
 * @returns {boolean}
 */
function debeFinalizarEvento(evento, now = new Date()) {
  if (!evento.fechaFin || !evento.horaFin) return false;
  const [hours, minutes] = evento.horaFin.split(':').map(Number);
  const fin = new Date(evento.fechaFin);
  fin.setHours(hours, minutes, 0, 0);
  return fin <= now;
}

/**
 * Indica si el evento continúa al día siguiente
 * @param {Object} evento - Documento de evento
 * @param {Date} now - Fecha actual
 * @returns {boolean}
 */
function continuaManana(evento, now = new Date()) {
  if (!evento.fechaFin || !evento.horaFin) return false;
  const fechaFin = new Date(evento.fechaFin);
  if (now.toDateString() === fechaFin.toDateString()) return false;
  const [hours, minutes] = evento.horaFin.split(':').map(Number);
  const finHoy = new Date(now);
  finHoy.setHours(hours, minutes, 0, 0);
  return now > finHoy && now < fechaFin;
}

/**
 * Determina si un evento en espera debe reanudarse
 * @param {Object} evento - Documento de evento
 * @param {Date} now - Fecha actual
 * @returns {boolean}
 */
function debeReanudarEvento(evento, now = new Date()) {
  if (!evento.horaInicio || !evento.fechaFin) return false;
  const [hours, minutes] = evento.horaInicio.split(':').map(Number);
  const inicioHoy = new Date(now);
  inicioHoy.setHours(hours, minutes, 0, 0);
  if (now > new Date(evento.fechaFin)) return false;
  return now >= inicioHoy;
}

/**
 * Consulta eventos y actualiza su estado según la fecha y hora.
 * @param {Date} now - Fecha actual (para pruebas)
 */
async function actualizarEventosEnProceso(now = new Date()) {
  try {
    const [activos, enProceso, enEspera] = await Promise.all([
      Evento.find({ estado: 'activo', fechaInicio: { $lte: now } }),
      Evento.find({ estado: 'En proceso' }),
      Evento.find({ estado: 'En espera' })
    ]);

    for (const evento of activos) {
      if (debeIniciarEvento(evento, now)) {
        evento.estado = 'En proceso';
        await evento.save();
        broadcast({ type: 'event-status', evento: String(evento._id), estado: evento.estado });
      }
    }

    for (const evento of enProceso) {
      if (debeFinalizarEvento(evento, now)) {
        evento.estado = 'finalizado';
        await evento.save();
        broadcast({ type: 'event-status', evento: String(evento._id), estado: evento.estado });
      } else if (continuaManana(evento, now)) {
        evento.estado = 'En espera';
        await evento.save();
        broadcast({ type: 'event-status', evento: String(evento._id), estado: evento.estado });
        console.info(`Evento "${evento.nombre}" continuará el día siguiente`);
      }
    }

    for (const evento of enEspera) {
      if (debeReanudarEvento(evento, now)) {
        evento.estado = 'En proceso';
        await evento.save();
        broadcast({ type: 'event-status', evento: String(evento._id), estado: evento.estado });
      }
    }
  } catch (error) {
    console.error('Error en cron de eventos:', error);
  }
}

cron.schedule('* * * * *', () => actualizarEventosEnProceso());

module.exports = { actualizarEventosEnProceso, debeIniciarEvento, debeFinalizarEvento, continuaManana, debeReanudarEvento };

