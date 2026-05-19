const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { verificarToken } = require('../middleware/auth');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// GET /api/archivero - Listar archivos en la carpeta uploads
router.get('/', verificarToken, (req, res) => {
  try {
    const getFiles = (dirPath, prefix = '') => {
      let results = [];
      if (!fs.existsSync(dirPath)) return results;
      
      const list = fs.readdirSync(dirPath);
      list.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getFiles(filePath, path.join(prefix, file)));
        } else {
          // Imágenes y documentos comunes
          if (/\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i.test(file)) {
            results.push({
              nombre: file,
              ruta: `/uploads/${path.join(prefix, file).replace(/\\/g, '/')}`,
              size: stat.size,
              fecha: stat.mtime
            });
          }
        }
      });
      return results;
    };

    const files = getFiles(UPLOADS_DIR);
    res.json({ ok: true, data: files });
  } catch (error) {
    console.error('Error al leer archivero:', error);
    res.status(500).json({ ok: false, message: 'Error al leer la carpeta de archivos' });
  }
});

const multer = require('multer');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Limpiar el nombre del archivo: minúsculas, sin espacios, con timestamp
    const cleanName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.-]/g, '');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Permitir imágenes y documentos comunes
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];
    if (file.mimetype.startsWith('image/') || allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo imágenes y documentos comunes (PDF, Word, Excel, PowerPoint, TXT, CSV)'));
    }
  }
});

// POST /api/archivero/upload - Subir un archivo (requiere autenticación)
router.post('/upload', verificarToken, (req, res) => {
  console.log('--- Nueva petición de subida ---');
  
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Error de Multer:', err);
      return res.status(403).json({ ok: false, message: 'Error de subida: ' + err.message });
    }
    
    if (!req.file) {
      console.log('No se recibió archivo');
      return res.status(400).json({ ok: false, message: 'No se subió ningún archivo' });
    }
    
    console.log('Archivo recibido:', req.file.filename);

    // Lógica de reemplazo (borrar anterior si se solicita)
    const { replace } = req.query;
    if (replace && replace.startsWith('/uploads/')) {
      const oldPath = path.join(UPLOADS_DIR, replace.replace('/uploads/', ''));
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
          console.log('Archivo anterior eliminado:', oldPath);
        } catch (e) {
          console.error('No se pudo borrar el archivo anterior:', e.message);
        }
      }
    }

    // Respuesta ultra simplificada para evitar problemas de parseo
    res.status(200).send({ 
      ok: true, 
      ruta: `/uploads/${req.file.filename}`
    });
  });
});

// DELETE /api/archivero/:filename - Eliminar un archivo físico del servidor (requiere autenticación)
router.delete('/:filename', verificarToken, (req, res) => {
  try {
    const { filename } = req.params;
    
    // Evitar ataques de path traversal (ej. ../../etc/passwd)
    const safeFilename = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeFilename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ ok: false, message: 'Archivo no encontrado' });
    }
    
    fs.unlinkSync(filePath);
    console.log(`[DELETE ARCHIVO] Eliminado exitosamente: ${filePath}`);
    res.json({ ok: true, message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al borrar archivo:', error);
    res.status(500).json({ ok: false, message: 'Error interno al intentar eliminar el archivo' });
  }
});

module.exports = router;
