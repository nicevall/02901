const jwt = require('jsonwebtoken');

const auth = (rolesPermitidos = []) => {
  return (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return res.status(401).json({ msg: 'Acceso denegado. Token no proporcionado' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Verificación de roles (si hay)
      if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(decoded.rol)) {
        return res.status(403).json({ msg: 'No tienes permisos para acceder a esta ruta.' });
      }

      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token inválido' });
    }
  };
};

module.exports = auth;
