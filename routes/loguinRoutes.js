const express = require('express');
const router = express.Router();
const loguinController = require('../controllers/loguinController');

// Ruta para iniciar sesión
router.post('/login', loguinController.login);
router.post('/logout', loguinController.logout);
router.put('/cambiarEstadoUsuario', loguinController.cambiarEstadoUsuario);


// Ruta protegida para verificar autenticación
router.get('/verificar', loguinController.verificarAutenticacion, (req, res) => {
    res.json({ success: true });
});

module.exports = router;
