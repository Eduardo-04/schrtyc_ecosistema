const express = require('express')
const router = express.Router()
const { verificarToken, verificarRol } = require('../middleware/auth')
const { pool } = require('../db')

// GET /api/estaciones  — público (solo activas)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM estaciones WHERE activo = 1')
    res.json({ ok: true, data: rows })
  } catch (error) {
    console.error('Error al obtener estaciones:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// Rutas protegidas (Solo admin y editor_prog pueden escribir o ver todas)
router.use(verificarToken, verificarRol(['admin', 'editor_prog']))

// GET /api/estaciones/todas  — CRUD (todas, incluso inactivas)
router.get('/todas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM estaciones')
    res.json({ ok: true, data: rows })
  } catch (error) {
    console.error('Error al obtener todas las estaciones:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// POST /api/estaciones
router.post('/', async (req, res) => {
  try {
    const { nombre, tipo, frecuencia, streamUrl, activo, imagen, descripcion } = req.body
    if (!nombre || !tipo) return res.status(400).json({ ok: false, message: 'nombre y tipo son requeridos' })
    
    // Obtener el siguiente ID manualmente si no es auto_increment
    const [idRows] = await pool.query('SELECT MAX(id) as maxId FROM estaciones')
    const nextId = (idRows[0].maxId || 0) + 1

    await pool.query(
      `INSERT INTO estaciones (id, nombre, tipo, frecuencia, streamUrl, activo, imagen, descripcion) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextId, nombre, tipo, frecuencia || '', streamUrl || '', activo !== undefined ? (activo ? 1 : 0) : 1, imagen || '', descripcion || '']
    )

    res.status(201).json({ ok: true, data: { id: nextId, ...req.body } })
  } catch (error) {
    console.error('Error al crear estación:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// PUT /api/estaciones/:id
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { nombre, tipo, frecuencia, streamUrl, activo, imagen, descripcion } = req.body

    const [result] = await pool.query(
      `UPDATE estaciones SET 
       nombre = COALESCE(?, nombre), 
       tipo = COALESCE(?, tipo), 
       frecuencia = COALESCE(?, frecuencia), 
       streamUrl = COALESCE(?, streamUrl), 
       activo = COALESCE(?, activo), 
       imagen = COALESCE(?, imagen), 
       descripcion = COALESCE(?, descripcion) 
       WHERE id = ?`,
      [nombre, tipo, frecuencia, streamUrl, activo !== undefined ? (activo ? 1 : 0) : null, imagen, descripcion, id]
    )

    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: 'Estación no encontrada' })
    
    res.json({ ok: true, message: 'Estación actualizada' })
  } catch (error) {
    console.error('Error al actualizar estación:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// DELETE /api/estaciones/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const [result] = await pool.query('DELETE FROM estaciones WHERE id = ?', [id])
    
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: 'Estación no encontrada' })
    
    res.json({ ok: true, message: 'Estación eliminada' })
  } catch (error) {
    console.error('Error al eliminar estación:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

module.exports = router