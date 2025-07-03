const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');



router.post('/registrar', categoriaController.registrarCategoria);

router.get('/', categoriaController.obtenerCategoria);

router.get('/exportExcel', categoriaController.exportExcel);

router.delete('/:id', categoriaController.eliminarCategoria); // Corregido: Añadida la barra inclinada

router.put('/modificar/:id', categoriaController.modificarCategoria);

router.get('/obtener', categoriaController.obtenerSiguienteId);


module.exports = router;
