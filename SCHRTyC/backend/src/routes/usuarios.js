const express = require('express')
const bcrypt  = require('bcryptjs')
const { pool } = require('../db')
const { verificarToken, verificarRol } = require('../middleware/auth')
const router  = express.Router()

// Todos los endpoints de aquí requieren ser ADMIN
router.use(verificarToken, verificarRol(['admin']))

// GET /api/usuarios - Listar todos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY id DESC')
    res.json({ ok: true, usuarios: rows })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al obtener usuarios' })
  }
})

// POST /api/usuarios - Crear nuevo
router.post('/', async (req, res) => {
  const { nombre, email, password, rol } = req.body
  
  if (!nombre || !email || !password || !rol)
    return res.status(400).json({ ok: false, message: 'Todos los campos son obligatorios' })

  try {
    const password_hash = bcrypt.hashSync(password, 10)
    await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password_hash, rol]
    )
    res.json({ ok: true, message: 'Usuario creado con éxito' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') 
      return res.status(400).json({ ok: false, message: 'El email ya está registrado' })
    res.status(500).json({ ok: false, message: 'Error al crear usuario' })
  }
})

// PUT /api/usuarios/:id - Editar
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { nombre, email, rol, activo, password } = req.body

  try {
    let query = 'UPDATE usuarios SET nombre=?, email=?, rol=?, activo=? '
    let params = [nombre, email, rol, activo]

    if (password) {
      query += ', password_hash=? '
      params.push(bcrypt.hashSync(password, 10))
    }

    query += ' WHERE id=?'
    params.push(id)

    await pool.query(query, params)
    res.json({ ok: true, message: 'Usuario actualizado' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al actualizar usuario' })
  }
})

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  // Evitar que el admin se borre a sí mismo
  if (parseInt(id) === req.usuario.id)
    return res.status(400).json({ ok: false, message: 'No puedes eliminar tu propio usuario' })

  try {
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id])
    res.json({ ok: true, message: 'Usuario eliminado' })
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al eliminar usuario' })
  }
})

module.exports = router
