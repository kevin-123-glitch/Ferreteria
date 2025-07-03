const express = require('express');
const router = express.Router();
const unidadController  = require('../controllers/unidadController');



router.post('/registrar', unidadController .registrarUnidad);

router.get('/', unidadController .obtenerUnidad);

router.get('/exportExcel', unidadController .exportExcel);

router.delete('/:id', unidadController .eliminarUnidad); // Corregido: Añadida la barra inclinada

router.put('/modificar/:id', unidadController .modificarUnidad);

router.get('/obtener', unidadController .obtenerSiguienteId);


module.exports = router;
