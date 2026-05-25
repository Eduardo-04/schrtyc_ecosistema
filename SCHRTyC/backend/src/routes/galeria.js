const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth');
const { pool } = require('../db');

// GET /api/galeria
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM galeria ORDER BY fecha_registro DESC, id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener galería:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// GET /api/galeria/filtros
router.get('/filtros', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT nombre FROM galeria_filtros');
    res.json(rows.map(r => r.nombre));
  } catch (error) {
    console.error('Error al obtener filtros:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// GET /api/galeria/autores
router.get('/autores', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM galeria_autores ORDER BY nombre ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener autores:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// Rutas protegidas (Solo admin y editor_prensa pueden escribir)
router.use(verificarToken, verificarRol(['admin', 'editor_prensa']));

// POST /api/galeria/autores
router.post('/autores', async (req, res) => {
  try {
    const { nombre, foto, biografia } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Nombre del autor requerido' });
    
    const [result] = await pool.query('INSERT INTO galeria_autores (nombre, foto, biografia) VALUES (?, ?, ?)', [nombre, foto || '', biografia || '']);
    res.json({ ok: true, item: { id: result.insertId, nombre, foto, biografia } });
  } catch (error) {
    console.error('Error al crear autor:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// PUT /api/galeria/autores/:id
router.put('/autores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, foto, biografia } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Nombre del autor requerido' });
    
    const [result] = await pool.query(
      'UPDATE galeria_autores SET nombre = ?, foto = ?, biografia = ? WHERE id = ?',
      [nombre, foto || '', biografia || '', id]
    );
    
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, mensaje: 'Autor no encontrado' });
    res.json({ ok: true, item: { id: parseInt(id), nombre, foto, biografia } });
  } catch (error) {
    console.error('Error al actualizar autor:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// DELETE /api/galeria/autores/:id
router.delete('/autores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM galeria_autores WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, mensaje: 'Autor no encontrado' });
    res.json({ ok: true, mensaje: 'Autor eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar autor:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// POST /api/galeria/filtros
router.post('/filtros', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Nombre del filtro requerido' });
    
    await pool.query('INSERT INTO galeria_filtros (nombre) VALUES (?) ON DUPLICATE KEY UPDATE nombre = nombre', [nombre]);
    
    const [rows] = await pool.query('SELECT nombre FROM galeria_filtros');
    res.json({ ok: true, filtros: rows.map(r => r.nombre) });
  } catch (error) {
    console.error('Error al crear filtro:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// DELETE /api/galeria/filtros/:nombre
router.delete('/filtros/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    await pool.query('DELETE FROM galeria_filtros WHERE nombre = ?', [nombre]);
    
    const [rows] = await pool.query('SELECT nombre FROM galeria_filtros');
    res.json({ ok: true, filtros: rows.map(r => r.nombre) });
  } catch (error) {
    console.error('Error al eliminar filtro:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// POST /api/galeria
router.post('/', async (req, res) => {
  try {
    const { titulo, autor, tecnica, formato, ciudad, año, descripcion, imagen, telefono, fecha, url } = req.body;
    if (!imagen) return res.status(400).json({ ok: false, mensaje: 'URL de imagen requerida' });

    const id = req.body.id || Date.now();
    const finalFechaRegistro = new Date().toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO galeria (id, titulo, url, fecha, autor, tecnica, formato, ciudad, año, descripcion, imagen, telefono, fecha_registro) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, titulo || 'Sin título', url || '', fecha || null, autor || 'Anónimo', tecnica || '', formato || '', ciudad || '', año || '', descripcion || '', imagen, telefono || '', finalFechaRegistro]
    );

    res.json({ ok: true, item: { id, ...req.body, fecha_registro: finalFechaRegistro } });
  } catch (error) {
    console.error('Error al crear item de galería:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// PUT /api/galeria/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, autor, tecnica, formato, ciudad, año, descripcion, imagen, telefono, fecha, url } = req.body;

    const [result] = await pool.query(
      `UPDATE galeria SET 
       titulo = COALESCE(?, titulo), 
       autor = COALESCE(?, autor), 
       tecnica = COALESCE(?, tecnica), 
       formato = COALESCE(?, formato), 
       ciudad = COALESCE(?, ciudad), 
       año = COALESCE(?, año), 
       descripcion = COALESCE(?, descripcion), 
       imagen = COALESCE(?, imagen), 
       telefono = COALESCE(?, telefono),
       fecha = COALESCE(?, fecha),
       url = COALESCE(?, url)
       WHERE id = ?`,
      [titulo, autor, tecnica, formato, ciudad, año, descripcion, imagen, telefono, fecha, url, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ ok: false, mensaje: 'Item no encontrado' });

    const [rows] = await pool.query('SELECT * FROM galeria WHERE id = ?', [id]);
    res.json({ ok: true, item: rows[0] });
  } catch (error) {
    console.error('Error al actualizar item de galería:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// DELETE /api/galeria/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM galeria WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) return res.status(404).json({ ok: false, mensaje: 'Item no encontrado' });
    
    res.json({ ok: true, mensaje: 'Item eliminado' });
  } catch (error) {
    console.error('Error al eliminar item de galería:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;

