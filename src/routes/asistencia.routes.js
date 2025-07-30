const express = require('express');
const router = express.Router();
const { registrarAsistencia } = require('../controllers/asistencia.controller');
const authMiddleware = require('../middlewares/auth');

// Solo estudiantes
router.post('/registrar', authMiddleware(['estudiante']), registrarAsistencia);

module.exports = router;
