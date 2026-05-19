const express = require('express')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const { pool } = require('../db')
const router  = express.Router()

// Helper para generar tokens
const generarTokens = (usuario) => {
  const payload = { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
  
  return { accessToken, refreshToken }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ ok: false, message: 'Email y contraseña requeridos' })

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND activo = 1', [email])
    const usuario = rows[0]

    if (!usuario || !bcrypt.compareSync(password, usuario.password_hash))
      return res.status(401).json({ ok: false, message: 'Credenciales incorrectas' })

    const { accessToken, refreshToken } = generarTokens(usuario)

    // Guardar Refresh Token en cookie segura
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true en prod (HTTPS), false en dev
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    })

    res.json({
      ok: true,
      token: accessToken,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ ok: false, message: 'Error en el servidor' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken
  
  if (!refreshToken) 
    return res.status(401).json({ ok: false, message: 'No hay refresh token' })

  try {
    const datos = jwt.verify(refreshToken, process.env.JWT_SECRET)
    const { accessToken, refreshToken: newRefreshToken } = generarTokens(datos)

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({
      ok: true,
      token: accessToken,
      usuario: { id: datos.id, nombre: datos.nombre, rol: datos.rol }
    })
  } catch (err) {
    res.status(403).json({ ok: false, message: 'Refresh token inválido o expirado' })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken')
  res.json({ ok: true, message: 'Sesión cerrada' })
})

// GET /api/auth/verificar (Cambiado a GET para mejor semántica)
router.get('/verificar', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) return res.status(401).json({ ok: false, message: 'Sin token' })

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ ok: true, usuario: datos })
  } catch {
    res.status(403).json({ ok: false, message: 'Token inválido o expirado' })
  }
})

module.exports = router