const express = require('express');
const router = express.Router();
const registrosController = require('../controllers/registrosController');

// Rutas de ejemplo para MariaDB
router.post('/', registrosController.crearRegistro);
router.get('/', registrosController.obtenerRegistros);

module.exports = router;
