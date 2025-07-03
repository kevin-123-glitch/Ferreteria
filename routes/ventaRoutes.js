const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');



router.get('/buscarProducto', ventaController.buscarProducto);
router.get('/buscarCliente', ventaController.buscarCliente);/*
router.get('/serie/:tipoDocumento', compraController.obtenerSerieYNumeroDocumento);
*/
// Ruta para obtener la serie y el número de documento
router.get('/serie/:tipoDocumento', ventaController.getSerieYNumero);

// Ruta para incrementar el número de documento y actualizar la serie
router.post('/incrementar/:tipoDocumento', ventaController.incrementarDocumento);

router.post('/registrar', ventaController.registrarVenta);

router.get('/', ventaController.Ventas);

router.get('/:Id_venta', ventaController.DetallesVentas); // Corregido: Añadida la barra inclinada



module.exports = router;
