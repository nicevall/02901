const Usuario = require('../models/Model.user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { incrementMetric } = require("../utils/dashboard.metrics");
const { enviarCorreo } = require('../utils/email.util');

// Registro de usuario
exports.registrarUsuario = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verifica si ya existe
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
    }

    const hashed = await bcrypt.hash(contrasena, 10);

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(codigo, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      contrasena: hashed,
      rol,
      codigoVerificacion: hashedCode,
      codigoVerificacionExpira: new Date(Date.now() + 60 * 60 * 1000),
    });

    await nuevoUsuario.save();
    await enviarCorreo(
      correo,
      'Código de verificación',
      `Tu código de verificación es: ${codigo}`
    );
    await incrementMetric("usuarios");

    res.status(201).json({ mensaje: '✅ Usuario registrado. Revisa tu correo para verificarlo.' });
  } catch (err) {
    console.error('[Registro] Error:', err);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// Actualizar usuario (sin permitir modificar el rol)
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, correo, contrasena } = req.body;

    // Buscar el usuario
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar y actualizar campos si se proporcionan
    if (nombre) usuario.nombre = nombre;

    if (correo) {
      // Verificar si el nuevo correo ya está en uso por otro usuario
      const existeCorreo = await Usuario.findOne({ correo, _id: { $ne: id } });
      if (existeCorreo) {
        return res.status(409).json({ error: 'Ese correo ya está en uso por otro usuario' });
      }
      usuario.correo = correo;
    }

    if (contrasena) {
      const hashed = await bcrypt.hash(contrasena, 10);
      usuario.contrasena = hashed;
    }

    // Guardar cambios
    await usuario.save();

    return res.status(200).json({
      mensaje: '✅ Usuario actualizado correctamente',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol, // El rol se muestra, pero no se puede modificar
      },
    });
  } catch (error) {
    console.error('[UpdateUsuario] Error:', error);
    return res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};


// Inicio de sesión
exports.iniciarSesion = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    // Validación básica
    if (!correo?.trim() || !contrasena?.trim()) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Correo y contraseña son obligatorios',
      });
    }

    // Buscar usuario por correo
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      // Para evitar ataques de enumeración, usa el mismo mensaje
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales inválidas',
      });
    }

    // Validar contraseña
    const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValido) {
      return res.status(401).json({
        ok: false,
        mensaje: 'Credenciales inválidas',
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        rol: usuario.rol,
        correo: usuario.correo,
      },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    // Responder
    return res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('[Auth] Error en iniciarSesion:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error interno al iniciar sesión',
    });
  }
};


// Obtener perfil del usuario autenticado
exports.obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.params; // Obtener la ID del usuario desde el cuerpo de la petición

    if (!id) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Se requiere el ID del usuario ',
      });
    }

    const usuario = await Usuario.findById(id).select('-contrasena'); // Excluye la contraseña

    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      ok: true,
      usuario,
    });
  } catch (error) {
    console.error('[Perfil] Error al obtener el perfil:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener el perfil del usuario',
    });
  }
};

// Verificar correo electrónico
exports.verificarCorreo = async (req, res) => {
  try {
    const { correo, codigo } = req.body;
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }
    console.log('[Verificación] Código recibido:', codigo);
    if (usuario.correoVerificado) {
      return res.status(400).json({ ok: false, mensaje: 'El correo ya está verificado' });
    }
    if (!usuario.codigoVerificacion || !usuario.codigoVerificacionExpira) {
      return res.status(400).json({ ok: false, mensaje: 'No hay código de verificación' });
    }
    if (usuario.codigoVerificacionExpira < new Date()) {
      return res.status(400).json({ ok: false, mensaje: 'El código expiró' });
    }
    const esValido = await bcrypt.compare(codigo, usuario.codigoVerificacion);
    if (!esValido) {
      return res.status(400).json({ ok: false, mensaje: 'Código inválido' });
    }
    usuario.correoVerificado = true;
    usuario.codigoVerificacion = undefined;
    usuario.codigoVerificacionExpira = undefined;
    await usuario.save();

    return res.status(200).json({ ok: true, mensaje: 'Correo verificado correctamente' });
  } catch (error) {
    console.error('[VerificarCorreo] Error:', error);
    return res.status(500).json({ ok: false, mensaje: 'Error al verificar el correo' });
  }
};

