
const express = require('express');
const router = express.Router();
const tableroController = require('../controllers/tableroController');

// Ruta para obtener el total de productos con stock mínimo
router.get('/stock', tableroController.getTotalProductos);

// Ruta para obtener el ingreso diario
router.get('/ingreso', tableroController.getIngresoDiario);

// Ruta para obtener el egreso diario
router.get('/egreso', tableroController.getEgresoDiario);

// Ruta para obtener la ganancia diaria
router.get('/ganancia', tableroController.getGananciaDiaria);

router.get('/ingresoMes', tableroController.getTotalVentasPorMes);

router.get('/egresoMes', tableroController.getTotalComprasMesActual);

router.get('/productosTop', tableroController.getTop10ProductosMasVendidos);

 
module.exports = router;

