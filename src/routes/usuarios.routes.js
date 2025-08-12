const express = require('express');
const router = express.Router();

const { registrarUsuario, iniciarSesion, actualizarUsuario, obtenerPerfil, verificarCorreo, enviarCodigoDocente, listarDocentes } = require('../controllers/usuarios.controller');
const auth =  require('../middlewares/auth');
const controller = require('../controllers/usuarios.controller')

router.post('/registrar', controller.registrarUsuario);

router.post('/docente/enviar-codigo', enviarCodigoDocente);

router.post('/verificar-correo', controller.verificarCorreo);

router.post('/login', controller.iniciarSesion);

router.get('/perfil/:id', controller.obtenerPerfil);

router.get('/docentes', auth(['admin']), controller.listarDocentes);


router.put('/:id', auth(['estudiante', 'docente', 'admin']), controller.actualizarUsuario);



module.exports = router;
