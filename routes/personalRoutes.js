const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personalController');

/*
router.post('/insertarRegistros', personalController.insertarRegistros);
/*
router.post('/createEstadoUsuario', personalController.insertEstadoUsuario);
*/

router.get('/perfiles', personalController.getPerfiles);
router.get('/getTdoc_ident', personalController.getTdoc_ident);
router.get('/getEstado_usuario', personalController.getEstado_usuario);

router.post('/registrar', personalController.registrarPersonal);

router.get('/', personalController.obtenerPersonal);


router.delete('/:id', personalController.eliminarPersonal); // Corregido: Añadida la barra inclinada

router.get('/exportExcel', personalController.exportExcel);
router.get('/exportPDF', personalController.exportPDF);


router.put('/modificar/:id', personalController.modificarPersonal);


module.exports = router;
