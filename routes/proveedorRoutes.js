const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');


router.get('/getTdoc_ident', proveedorController.getTdoc_ident);

router.post('/registrar', proveedorController.registrarProveedor);

router.get('/', proveedorController.obtenerProveedor);

router.get('/exportExcel', proveedorController.exportExcel);

router.delete('/:id', proveedorController.eliminarProveedor); 

router.put('/modificar/:id', proveedorController.modificarProveedor);


module.exports = router;
