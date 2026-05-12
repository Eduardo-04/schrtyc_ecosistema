const express = require('express')
const router  = express.Router()
const { verificarToken } = require('../middleware/auth')
const { pool } = require('../db')

// GET todos (con filtros opcionales: tipo, estacion, dia)
router.get('/', async (req, res) => {
  try {
    const { tipo, estacion, dia } = req.query
    let query = 'SELECT * FROM programacion WHERE 1=1'
    const params = []

    if (tipo) {
      query += ' AND tipo = ?'
      params.push(tipo)
    }
    if (estacion) {
      query += ' AND estacion = ?'
      params.push(estacion)
    }
    if (dia) {
      query += ' AND dia = ?'
      params.push(dia)
    }

    query += ' ORDER BY hora_inicio ASC'
    const [rows] = await pool.query(query, params)
    res.json({ ok: true, data: rows })
  } catch (error) {
    console.error('Error al obtener programación:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// GET por id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM programacion WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ ok: false, message: 'Programa no encontrado' })
    res.json({ ok: true, data: rows[0] })
  } catch (error) {
    console.error('Error al obtener programa de programación:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// POST crear
router.post('/', verificarToken, async (req, res) => {
  try {
    const { hora_inicio, hora_fin, nombre, conductor, estacion, descripcion, tipo, dia } = req.body
    if (!hora_inicio || !hora_fin || !nombre || !estacion || !tipo)
      return res.status(400).json({ ok: false, message: 'Faltan campos requeridos' })
    
    const [idRows] = await pool.query('SELECT MAX(id) as maxId FROM programacion')
    const nextId = (idRows[0].maxId || 0) + 1

    await pool.query(
      `INSERT INTO programacion (id, hora_inicio, hora_fin, nombre, conductor, estacion, descripcion, tipo, dia) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextId, hora_inicio, hora_fin, nombre, conductor || 'Sin asignar', estacion, descripcion || '', tipo, dia || null]
    )

    res.status(201).json({ ok: true, data: { id: nextId, ...req.body } })
  } catch (error) {
    console.error('Error al crear programa de programación:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// PUT editar
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id
    const { hora_inicio, hora_fin, nombre, conductor, estacion, descripcion, tipo, dia } = req.body

    const [result] = await pool.query(
      `UPDATE programacion SET 
       hora_inicio = COALESCE(?, hora_inicio), 
       hora_fin = COALESCE(?, hora_fin), 
       nombre = COALESCE(?, nombre), 
       conductor = COALESCE(?, conductor), 
       estacion = COALESCE(?, estacion), 
       descripcion = COALESCE(?, descripcion), 
       tipo = COALESCE(?, tipo), 
       dia = COALESCE(?, dia) 
       WHERE id = ?`,
      [hora_inicio, hora_fin, nombre, conductor, estacion, descripcion, tipo, dia, id]
    )

    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: 'Programa no encontrado' })
    
    res.json({ ok: true, message: 'Programa actualizado' })
  } catch (error) {
    console.error('Error al actualizar programa de programación:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// DELETE todos (o por estacion)
router.delete('/', verificarToken, async (req, res) => {
  try {
    const { estacion } = req.query
    let query = 'DELETE FROM programacion'
    const params = []

    if (estacion) {
      query += ' WHERE estacion = ?'
      params.push(estacion)
    }

    const [result] = await pool.query(query, params)
    res.json({ ok: true, eliminados: result.affectedRows })
  } catch (error) {
    console.error('Error al eliminar programas de programación:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// DELETE por id
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const id = req.params.id
    const [result] = await pool.query('DELETE FROM programacion WHERE id = ?', [id])
    
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: 'Programa no encontrado' })
    
    res.json({ ok: true, message: 'Programa eliminado' })
  } catch (error) {
    console.error('Error al eliminar programa de programación:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

module.exports = router