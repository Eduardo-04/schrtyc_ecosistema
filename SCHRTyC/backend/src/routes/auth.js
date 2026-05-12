const express = require('express')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const router  = express.Router()

// Usuarios cargados desde variables de entorno para mayor seguridad
const getUsuarios = () => [
  { id: 1, nombre: 'Administrador', email: process.env.ADMIN_EMAIL, hash: process.env.ADMIN_HASH, rol: 'admin' },
  { id: 2, nombre: 'Editor',        email: process.env.EDITOR_EMAIL, hash: process.env.EDITOR_HASH, rol: 'editor' },
]

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const USUARIOS = getUsuarios()

  if (!email || !password)
    return res.status(400).json({ ok:false, message:'Email y contraseña requeridos' })

  const usuario = USUARIOS.find(u => u.email === email)

  if (!usuario || !bcrypt.compareSync(password, usuario.hash))
    return res.status(401).json({ ok:false, message:'Credenciales incorrectas' })

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({
    ok: true,
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
  })
})

// POST /api/auth/verificar
router.post('/verificar', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).json({ ok:false, message:'Sin token' })

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ ok:true, usuario: datos })
  } catch {
    res.status(403).json({ ok:false, message:'Token inválido o expirado' })
  }
})

module.exports = router