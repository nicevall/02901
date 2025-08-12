const express = require('express');
const router = express.Router();
// Las fechas y horas son opcionales; se puede indicar la duracion en dias u horas del evento
const {
  crearEvento,
  actualizarEvento,
  obtenerEventos,
  obtenerEventoPorId,
  eliminarEvento,
  finalizarEvento,
  obtenerMisEventos,
  generarReporteEvento
} = require('../controllers/evento.controller');
const authMiddleware = require('../middlewares/auth');

router.get('/mis', authMiddleware(['docente', 'admin']), obtenerMisEventos);

router.post('/crear', authMiddleware(['docente', 'admin']), crearEvento);

router.get('/', obtenerEventos);

router.get('/:id', obtenerEventoPorId);

router.put('/:id', authMiddleware(['docente', 'admin']), actualizarEvento);

router.post('/:id/finalizar', authMiddleware(['docente', 'admin']), finalizarEvento);

router.get('/:id/generarPDF', authMiddleware(['docente', 'admin']), generarReporteEvento);
router.delete('/:id', authMiddleware(['docente', 'admin']), eliminarEvento);

module.exports = router;
