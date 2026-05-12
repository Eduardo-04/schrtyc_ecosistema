const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, message: 'Token requerido' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.log('JWT Error:', error.message);
    res.status(403).json({ ok: false, message: 'Token inválido: ' + error.message });
  }
};

module.exports = { verificarToken };