const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistencia.controllers');
const authMiddleware = require('../middlewares/auth');

// Solo estudiantes
router.post('/registrar', authMiddleware(['estudiante']), asistenciaController.registrarAsistencia);

module.exports = router;
