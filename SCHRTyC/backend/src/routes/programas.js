const express = require('express')
const router  = express.Router()
const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')
const { verificarToken, verificarRol } = require('../middleware/auth')
const { pool } = require('../db')

// ── Storage ───────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/programas')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `poster_${Date.now()}${ext}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /jpeg|jpg|png|webp/.test(file.mimetype))
  }
})

// ── Helper: parsear embeds ─────────────────────────────────────
const parsearEmbeds = (raw, fallback = []) => {
  if (!raw) return fallback;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'object') return raw; // Para cuando viene de MariaDB (mysql2 ya lo parsea)
  try { 
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  }
  catch { return fallback }
}

// ── GET /api/programas ────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { estacion, tipo, activo } = req.query
    let query = 'SELECT * FROM programas WHERE 1=1'
    const params = []

    if (estacion) {
      query += ' AND LOWER(estacion) = ?'
      params.push(estacion.toLowerCase())
    }
    if (tipo) {
      query += ' AND LOWER(tipo) = ?'
      params.push(tipo.toLowerCase())
    }
    if (activo !== undefined) {
      query += ' AND activo = ?'
      params.push(activo === 'true' ? 1 : 0)
    }

    const [rows] = await pool.query(query, params)
    // mysql2 parsea el campo JSON automáticamente si el driver está bien configurado
    // o lo devuelve como string dependiendo de la versión/configuración
    const data = rows.map(p => ({
      ...p,
      embeds: parsearEmbeds(p.embeds)
    }))

    res.json({ ok: true, data })
  } catch (error) {
    console.error('Error al obtener programas:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// Rutas protegidas (Solo admin y editor_prog pueden escribir)
router.use(verificarToken, verificarRol(['admin', 'editor_prog']))

// ── POST /api/programas ───────────────────────────────────────
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const {
      nombre, conductor, horario, descripcion, descripcionLarga,
      imagen: imagenBody,
      tipo, estacion, activo, embeds: embedsRaw
    } = req.body

    if (!nombre || !estacion || !tipo)
      return res.status(400).json({ ok: false, message: 'nombre, estacion y tipo son requeridos' })

    const imagen = req.file
      ? `/uploads/programas/${req.file.filename}`
      : (imagenBody || '')

    const [idRows] = await pool.query('SELECT MAX(id) as maxId FROM programas')
    const nextId = (idRows[0].maxId || 0) + 1

    const finalEmbeds = parsearEmbeds(embedsRaw)

    await pool.query(
      `INSERT INTO programas (id, nombre, conductor, horario, descripcion, descripcionLarga, imagen, tipo, estacion, activo, embeds) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextId, nombre, conductor || '', horario || '', descripcion || '', descripcionLarga || '', imagen, tipo, estacion, activo === 'false' ? 0 : 1, JSON.stringify(finalEmbeds)]
    )

    res.status(201).json({ ok: true, data: { id: nextId, ...req.body, imagen, embeds: finalEmbeds } })
  } catch (error) {
    console.error('Error al crear programa:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// ── PUT /api/programas/:id ────────────────────────────────────
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const id = req.params.id
    const [rows] = await pool.query('SELECT * FROM programas WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ ok: false, message: 'Programa no encontrado' })
    
    const programaActual = rows[0]
    const { embeds: embedsRaw, activo, ...resto } = req.body

    const imagen = req.file
      ? `/uploads/programas/${req.file.filename}`
      : (resto.imagen !== undefined ? resto.imagen : programaActual.imagen)

    const finalEmbeds = parsearEmbeds(embedsRaw, parsearEmbeds(programaActual.embeds))

    await pool.query(
      `UPDATE programas SET 
       nombre = COALESCE(?, nombre), 
       conductor = COALESCE(?, conductor), 
       horario = COALESCE(?, horario), 
       descripcion = COALESCE(?, descripcion), 
       descripcionLarga = COALESCE(?, descripcionLarga), 
       imagen = ?, 
       tipo = COALESCE(?, tipo), 
       estacion = COALESCE(?, estacion), 
       activo = ?, 
       embeds = ? 
       WHERE id = ?`,
      [resto.nombre, resto.conductor, resto.horario, resto.descripcion, resto.descripcionLarga, imagen, resto.tipo, resto.estacion, activo !== undefined ? (activo === 'true' || activo === true ? 1 : 0) : programaActual.activo, JSON.stringify(finalEmbeds), id]
    )

    const [updatedRows] = await pool.query('SELECT * FROM programas WHERE id = ?', [id])
    const updated = {
      ...updatedRows[0],
      embeds: parsearEmbeds(updatedRows[0].embeds)
    }
    res.json({ ok: true, data: updated })
  } catch (error) {
    console.error('Error al actualizar programa:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

// ── DELETE /api/programas/:id ─────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const [result] = await pool.query('DELETE FROM programas WHERE id = ?', [id])
    
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, message: 'Programa no encontrado' })
    
    res.json({ ok: true, message: 'Programa eliminado' })
  } catch (error) {
    console.error('Error al eliminar programa:', error)
    res.status(500).json({ ok: false, message: 'Error interno del servidor' })
  }
})

module.exports = router