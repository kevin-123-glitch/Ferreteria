const express = require('express');
const router = express.Router();
const marcaController  = require('../controllers/marcaController');



router.post('/registrar', marcaController .registrarMarca);

router.get('/', marcaController .obtenerMarca);

router.get('/exportExcel', marcaController .exportExcel);

router.delete('/:id', marcaController .eliminarMarca); // Corregido: Añadida la barra inclinada

router.put('/modificar/:id', marcaController .modificarMarca);

router.get('/obtener', marcaController .obtenerSiguienteId);


module.exports = router;
