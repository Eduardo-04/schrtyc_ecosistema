const express = require('express')
const router = express.Router()
const { verificarToken, verificarRol } = require('../middleware/auth')
const { pool } = require('../db')

// GET /api/noticias
router.get('/', async (req, res) => {
  try {
    const { categoria, publicada } = req.query
    let query = 'SELECT * FROM noticias WHERE 1=1'
    const params = []

    if (categoria) {
      query += ' AND categoria = ?'
      params.push(categoria)
    }
    if (publicada !== undefined) {
      query += ' AND publicada = ?'
      params.push(publicada === 'true' ? 1 : 0)
    }

    query += ' ORDER BY fecha DESC, id DESC'
    const [rows] = await pool.query(query, params)
    res.json({ ok: true, data: rows })
  } catch (error) {
    console.error('Error al obtener noticias:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// GET /api/noticias/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM noticias WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ ok: false, message: 'Noticia no encontrada' })
    res.json({ ok: true, data: rows[0] })
  } catch (error) {
    console.error('Error al obtener noticia:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// Rutas protegidas (Solo admin y editor_prensa pueden escribir)
router.use(verificarToken, verificarRol(['admin', 'editor_prensa']))

// POST /api/noticias
router.post('/', async (req, res) => {
  try {
    const { titulo, categoria, fecha, autor, publicada, destacada, descripcion, imagen, contenido, imagenes } = req.body
    if (!titulo || !categoria)
      return res.status(400).json({ ok: false, message: 'Título y categoría son requeridos' })

    const id = req.body.id || Date.now()
    const finalFecha = (fecha ? fecha.split('T')[0] : new Date().toISOString().split('T')[0])
    const finalAutor = autor || 'Administrador'

    await pool.query(
      `INSERT INTO noticias (id, titulo, categoria, fecha, autor, publicada, destacada, descripcion, imagen, contenido, imagenes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, titulo, categoria, finalFecha, finalAutor, publicada ? 1 : 0, destacada ? 1 : 0, descripcion, imagen, contenido, imagenes]
    )

    res.status(201).json({ ok: true, data: { id, ...req.body, fecha: finalFecha, autor: finalAutor } })
  } catch (error) {
    console.error('Error al crear noticia:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// PUT /api/noticias/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { titulo, categoria, fecha, autor, publicada, destacada, descripcion, imagen, contenido, imagenes } = req.body

    const finalFecha = fecha ? fecha.split('T')[0] : null

    console.log(`[UPDATE NOTICIA] id: ${id}, body:`, req.body)

    // Construir consulta dinámica para actualizar solo lo enviado o todo
    const [result] = await pool.query(
      `UPDATE noticias SET 
       titulo = COALESCE(?, titulo), 
       categoria = COALESCE(?, categoria), 
       fecha = COALESCE(?, fecha), 
       autor = COALESCE(?, autor), 
       publicada = COALESCE(?, publicada), 
       destacada = COALESCE(?, destacada), 
       descripcion = COALESCE(?, descripcion), 
       imagen = COALESCE(?, imagen), 
       contenido = COALESCE(?, contenido), 
       imagenes = COALESCE(?, imagenes) 
       WHERE id = ?`,
      [
        titulo,
        categoria,
        finalFecha,
        autor,
        publicada !== undefined ? (Boolean(publicada) ? 1 : 0) : null,
        destacada !== undefined ? (Boolean(destacada) ? 1 : 0) : null,
        descripcion,
        imagen,
        contenido,
        imagenes,
        id
      ]
    )

    console.log(`[UPDATE NOTICIA] Result:`, result)

    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: 'Noticia no encontrada' })

    res.json({ ok: true, message: 'Noticia actualizada' })
  } catch (error) {
    console.error('Error al actualizar noticia:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// DELETE /api/noticias/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.query('DELETE FROM noticias WHERE id = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, message: 'Noticia no encontrada' })
    }

    res.json({ ok: true, message: 'Noticia eliminada' })
  } catch (error) {
    console.error('Error al eliminar noticia:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

module.exports = router
