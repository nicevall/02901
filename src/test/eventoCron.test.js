const assert = require('assert');
const Evento = require('../models/model.evento');
const { actualizarEventosEnProceso } = require('../cron/eventoCron');

(async () => {
  const now = new Date('2024-01-01T18:00:00Z');

  const eventosActivos = [
    {
      nombre: 'Evento Activo',
      fechaInicio: new Date('2024-01-01'),
      horaInicio: '17:00',
      estado: 'activo',
      async save() { this.saved = true; }
    }
  ];

  const eventoFinaliza = {
    nombre: 'Evento Finaliza',
    fechaFin: new Date('2024-01-01'),
    horaFin: '17:00',
    estado: 'En proceso',
    async save() { this.saved = true; }
  };

  const eventoMultidia = {
    nombre: 'Evento Multidia',
    fechaFin: new Date('2024-01-03'),
    horaFin: '17:00',
    horaInicio: '17:00',
    estado: 'En proceso',
    async save() { this.saved = true; }
  };

  const eventosEnProceso = [eventoFinaliza, eventoMultidia];

  Evento.find = async (query) => {
    if (query.estado === 'activo') return eventosActivos;
    if (query.estado === 'En proceso') return eventosEnProceso;
    if (query.estado === 'En espera') return [];
    return [];
  };

  const logs = [];
  console.info = (msg) => logs.push(msg);

  await actualizarEventosEnProceso(now);

  assert.strictEqual(eventosActivos[0].estado, 'En proceso', 'Evento activo debe iniciar');
  assert.strictEqual(eventoFinaliza.estado, 'finalizado', 'Evento terminado debe finalizar');
  assert.strictEqual(eventoMultidia.estado, 'En espera', 'Evento multidía pasa a espera');
  assert.ok(logs.some(m => m.includes('continuará el día siguiente')), 'Debe registrar continuación');

  // Simular siguiente día para reanudar
  Evento.find = async (query) => {
    if (query.estado === 'activo') return [];
    if (query.estado === 'En proceso') return [];
    if (query.estado === 'En espera') return [eventoMultidia];
    return [];
  };

  await actualizarEventosEnProceso(new Date('2024-01-02T17:05:00Z'));

  assert.strictEqual(eventoMultidia.estado, 'En proceso', 'Evento multidía se reanuda');

  console.log('✅ Pruebas de eventoCron completadas');
  process.exit(0);
})();

