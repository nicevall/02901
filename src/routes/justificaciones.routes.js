const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/justificacion.controller');
const auth = require('../middlewares/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/crear', auth(['estudiante']), controller.crearJustificacion);
router.get('/pendientes/:docenteId', auth(['docente', 'admin']), controller.obtenerPendientes);
router.put('/:id/aprobar', auth(['docente', 'admin']), controller.aprobarJustificacion);
router.put('/:id/rechazar', auth(['docente', 'admin']), controller.rechazarJustificacion);
router.get('/estudiante/:id', auth(['estudiante', 'docente', 'admin']), controller.obtenerPorEstudiante);
router.post('/subir-documento', auth(['estudiante']), upload.single('archivo'), controller.subirDocumento);
router.get('/historial/:eventoId', auth(['docente', 'admin']), controller.historialEvento);

module.exports = router;
