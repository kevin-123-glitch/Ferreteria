const conexion = require('../config/conexion');

exports.login = (req, res) => {
    const { Usuario, Contraseña } = req.body;

    // Consulta para verificar las credenciales
    const query = 'SELECT * FROM personal WHERE Correo = ? OR Telefono = ?';
    conexion.query(query, [Usuario, Usuario], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            // Devolver JSON si no se encuentra el usuario
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const user = results[0];

        // Verifica el estado del usuario
        if (user.Id_Estado_usuario === 2) {
            return res.status(403).json({ error: 'Acceso denegado: tu cuenta está bloqueada.' });
        }

        // Verifica la contraseña (considera usar un hash en lugar de texto plano)
        if (Contraseña !== user.Contraseña) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Modificar el campo Id_Estado_usuario a 1
        const updateEstadoQuery = 'UPDATE personal SET Id_Estado_usuario = ? WHERE idPersonal = ?';
        conexion.query(updateEstadoQuery, [1, user.idPersonal], (updateErr) => {
            if (updateErr) {
                return res.status(500).json({ error: 'Error al actualizar el estado del usuario' });
            }

            // Consulta para obtener datos adicionales del usuario
            const userDetailsQuery = 'SELECT * FROM personal WHERE idPersonal = ?';
            conexion.query(userDetailsQuery, [user.idPersonal], (err, userDetails) => {
                if (err) {
                    return res.status(500).json({ error: 'Error en la base de datos' });
                }

                // Guarda la sesión del usuario y envía los datos del usuario en formato JSON
                req.session.user = userDetails[0];
                res.status(200).json(userDetails[0]);
            });
        });
    });
};


exports.logout = (req, res) => {
    const sessionId = req.sessionID; 

    const deleteSessionQuery = 'DELETE FROM sessions';
    conexion.query(deleteSessionQuery, [sessionId], (err) => {
        if (err) {
            return res.status(500).send('Error al eliminar la sesión de la base de datos');
        }

        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Error al cerrar sesión');
            }

            res.status(200).send('Sesión cerrada correctamente');
        });
    });
};

exports.cambiarEstadoUsuario =  (req, res) => {
    const { idPersonal } = req.body; // Asegúrate de enviar este dato en el cuerpo de la solicitud.

    // Consulta SQL para actualizar el estado del usuario
    const query = 'UPDATE personal SET Id_Estado_usuario = ? WHERE idPersonal = ?';

    try {
        // Ejecutar la consulta
        conexion.query(query, [3, idPersonal], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Error al actualizar el estado del usuario.' });
            }

            // Verificar si se actualizó algún registro
            if (results.affectedRows > 0) {
                return res.status(200).json({ message: 'Estado de usuario actualizado a 3 correctamente.' });
            }

            // Si no se encontró el usuario
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
};


// Verifica si el usuario está autenticado
exports.verificarAutenticacion = (req, res, next) => {
    if (req.session && req.session.usuario) {
        return next();
    }
    res.status(401).send('No autenticado');
};