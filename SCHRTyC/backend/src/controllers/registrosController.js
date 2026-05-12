const { pool } = require('../db');

const crearRegistro = async (req, res) => {
  try {
    const { titulo, texto } = req.body;
    // Asumiendo que usas Multer para subir la imagen:
    const ruta_imagen = req.file ? req.file.filename : null; 

    const [result] = await pool.query(
      'INSERT INTO registros (titulo, texto, ruta_imagen) VALUES (?, ?, ?)',
      [titulo, texto, ruta_imagen]
    );

    res.status(201).json({ id: result.insertId, titulo, texto, ruta_imagen });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerRegistros = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM registros ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener registros' });
  }
};

module.exports = { crearRegistro, obtenerRegistros };
