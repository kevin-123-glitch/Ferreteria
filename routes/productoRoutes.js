const express = require('express');
const router = express.Router();
const productoController  = require('../controllers/productoController');



router.post('/registrar', productoController.registrarProducto);

router.get('/', productoController.obtenerProducto);

router.get('/exportExcel', productoController.exportExcel);

router.delete('/:id', productoController.eliminarProducto); // Corregido: Añadida la barra inclinada

router.put('/modificar/:id', productoController.modificarProducto);

router.get('/obtener', productoController.obtenerSiguienteId);

router.get('/Combo_categoria', productoController.Combo_categoria);
router.get('/Combo_unidad', productoController.Combo_unidad);
router.get('/Combo_marca', productoController.Combo_marca);

router.get('/verificarCodigo', productoController.verificarCodigo);
router.get('/low-stock', productoController.getLowStockProducts);

module.exports = router;
