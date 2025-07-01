const express = require('express');
const router = express.Router();
const {
  crearEvento,
  actualizarEvento,
  obtenerEventos,
  obtenerEventoPorId,
  eliminarEvento
} = require('../controllers/evento.controllers');
const authMiddleware = require('../middlewares/auth');

router.post('/crear', authMiddleware(['docente', 'admin']), crearEvento);

router.get('/', obtenerEventos);
router.get('/:id', obtenerEventoPorId);

router.put('/:id', authMiddleware(['docente', 'admin']), actualizarEvento);

router.delete('/:id', authMiddleware(['docente', 'admin']), eliminarEvento);

module.exports = router;
