const express = require('express');
const router = express.Router();
const { verificarToken, verificarRol } = require('../middleware/auth');
const { pool } = require('../db');

const CAMPOS_EDITABLES = [
  'titulo',
  'herobadge',
  'herodescripcion',
  'seccionlabel',
  'secciontitulo',
  'contenido',
  'imagenportada',
  'multimedia',
  'tramites',
  'integrantes',
  'galerias',
];

// GET /api/paginas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM paginas');
    const db = {};
    rows.forEach(row => {
      db[row.slug] = {
        ...row,
        tramites: typeof row.tramites === 'string' ? JSON.parse(row.tramites) : row.tramites,
        integrantes: typeof row.integrantes === 'string' ? JSON.parse(row.integrantes) : row.integrantes,
        galerias: typeof row.galerias === 'string' ? JSON.parse(row.galerias) : row.galerias
      };
    });
    res.json(db);
  } catch (error) {
    console.error('Error al obtener páginas:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// GET /api/paginas/:slug
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM paginas WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Página no encontrada' });
    
    const pagina = {
      ...rows[0],
      tramites: typeof rows[0].tramites === 'string' ? JSON.parse(rows[0].tramites) : rows[0].tramites,
      integrantes: typeof rows[0].integrantes === 'string' ? JSON.parse(rows[0].integrantes) : rows[0].integrantes,
      galerias: typeof rows[0].galerias === 'string' ? JSON.parse(rows[0].galerias) : rows[0].galerias
    };
    res.json(pagina);
  } catch (error) {
    console.error('Error al obtener página:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

// PUT /api/paginas/:slug
router.put('/:slug', verificarToken, verificarRol(['admin', 'editor_inst']), async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Verificar si existe, si no, crear base
    const [rows] = await pool.query('SELECT slug FROM paginas WHERE slug = ?', [slug]);
    if (rows.length === 0) {
      await pool.query('INSERT INTO paginas (slug, titulo) VALUES (?, ?)', [slug, slug]);
    }

    const updates = [];
    const params = [];
    
    CAMPOS_EDITABLES.forEach(campo => {
      if (req.body[campo] !== undefined) {
        updates.push(`${campo} = ?`);
        let val = req.body[campo];
        if (campo === 'tramites' || campo === 'integrantes' || campo === 'galerias') {
          val = typeof val === 'object' ? JSON.stringify(val) : val;
        }
        params.push(val);
      }
    });

    if (updates.length > 0) {
      updates.push('ultimaactualizacion = ?');
      params.push(new Date().toISOString().split('T')[0]);
      params.push(slug);
      
      await pool.query(`UPDATE paginas SET ${updates.join(', ')} WHERE slug = ?`, params);
    }

    const [updatedRows] = await pool.query('SELECT * FROM paginas WHERE slug = ?', [slug]);
    const finalPagina = {
      ...updatedRows[0],
      tramites: typeof updatedRows[0].tramites === 'string' ? JSON.parse(updatedRows[0].tramites) : updatedRows[0].tramites,
      integrantes: typeof updatedRows[0].integrantes === 'string' ? JSON.parse(updatedRows[0].integrantes) : updatedRows[0].integrantes,
      galerias: typeof updatedRows[0].galerias === 'string' ? JSON.parse(updatedRows[0].galerias) : updatedRows[0].galerias
    };

    res.json({ ok: true, mensaje: 'Página actualizada con éxito', pagina: finalPagina });
  } catch (error) {
    console.error('Error al actualizar página:', error);
    res.status(500).json({ ok: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;