const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');


router.get('/getTdoc_ident', clienteController.getTdoc_ident);

router.post('/registrar', clienteController.registrarCliente);

router.get('/', clienteController.obtenerCliente);

router.get('/exportExcel', clienteController.exportExcel);

router.delete('/:id', clienteController.eliminarCliente); // Corregido: Añadida la barra inclinada

router.put('/modificar/:id', clienteController.modificarCliente);


 

module.exports = router;
