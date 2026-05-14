const express = require('express')
const router = express.Router()
const { verificarToken, verificarRol } = require('../middleware/auth')
const { pool } = require('../db')

// GET /api/configuracion (Público)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM configuracion WHERE id = 1')
    if (rows.length === 0) return res.status(404).json({ ok: false, message: 'Configuración no encontrada' })
    
    const config = rows[0]
    // mysql2 ya debería parsear los campos JSON si están definidos como tal
    const data = {
      identidad: typeof config.identidad === 'string' ? JSON.parse(config.identidad) : config.identidad,
      contacto:  typeof config.contacto === 'string' ? JSON.parse(config.contacto) : config.contacto,
      redes:     typeof config.redes === 'string' ? JSON.parse(config.redes) : config.redes,
      seo:       typeof config.seo === 'string' ? JSON.parse(config.seo) : config.seo,
      sistema:   typeof config.sistema === 'string' ? JSON.parse(config.sistema) : config.sistema,
    }
    
    res.json({ ok: true, data })
  } catch (err) {
    console.error('Error al obtener configuración:', err)
    res.status(500).json({ ok: false, message: err.message })
  }
})

// PUT /api/configuracion (Protegido - Solo Admin)
router.put('/', verificarToken, verificarRol(['admin']), async (req, res) => {
  try {
    const { identidad, contacto, redes, seo, sistema } = req.body
    
    // Verificar si existe
    const [rows] = await pool.query('SELECT id FROM configuracion WHERE id = 1')
    if (rows.length === 0) {
      await pool.query('INSERT INTO configuracion (id) VALUES (1)')
    }

    const updates = []
    const params = []
    
    if (identidad) { updates.push('identidad = ?'); params.push(JSON.stringify(identidad)) }
    if (contacto)  { updates.push('contacto = ?');  params.push(JSON.stringify(contacto)) }
    if (redes)     { updates.push('redes = ?');     params.push(JSON.stringify(redes)) }
    if (seo)       { updates.push('seo = ?');       params.push(JSON.stringify(seo)) }
    if (sistema)   { updates.push('sistema = ?');   params.push(JSON.stringify(sistema)) }

    if (updates.length > 0) {
      params.push(1)
      await pool.query(`UPDATE configuracion SET ${updates.join(', ')} WHERE id = ?`, params)
    }

    res.json({ ok: true, message: 'Configuración actualizada correctamente' })
  } catch (err) {
    console.error('Error al actualizar configuración:', err)
    res.status(500).json({ ok: false, message: err.message })
  }
})

module.exports = router

