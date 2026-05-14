const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ ok: false, message: 'Token requerido' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ ok: false, message: 'Token expirado o inválido', code: 'TOKEN_EXPIRED' });
  }
};

const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ ok: false, message: 'No autenticado' });
    
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ ok: false, message: 'No tienes permisos para realizar esta acción' });
    }
    
    next();
  };
};

module.exports = { verificarToken, verificarRol };