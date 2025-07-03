const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');


router.get('/buscarProducto', compraController.buscarProducto);
router.get('/buscarProveedor', compraController.buscarProveedor);/*
router.get('/serie/:tipoDocumento', compraController.obtenerSerieYNumeroDocumento);
*/
// Ruta para obtener la serie y el número de documento
router.get('/serie/:tipoDocumento', compraController.getSerieYNumero);

// Ruta para incrementar el número de documento y actualizar la serie
router.post('/incrementar/:tipoDocumento', compraController.incrementarDocumento);

router.post('/registrar', compraController.registrarCompra);

router.get('/', compraController.DetallesCompras);

router.get('/:Id_compra', compraController.getDetallesByCompraId); // Corregido: Añadida la barra inclinada


module.exports = router;
