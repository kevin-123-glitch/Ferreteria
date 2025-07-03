const conexion = require('../config/conexion');

const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/*exports.insertEstadoUsuario = (req, res) => {
    console.log('Datos recibidos:', req.body);

    let data = {
        Id_Estado_usuario: req.body.user_id,
        estado_usuario: req.body.estado_usuario
    };

    let sql = "INSERT INTO estado_usuario SET ?";
    conexion.query(sql, data, function (err, result) {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json({ error: 'Error al registrar el estado de usuario', details: err.message });
        } else {
            Object.assign(data, { id: result.insertId });
            res.json(data);
        }
    });
};*/


exports.insertEstadoUsuario = (req, res) => {
    console.log('Datos recibidos:', req.body);

    const { user_id, estado_usuario } = req.body;

    // Verifica si user_id y estado_usuario están presentes
    if (!user_id || !estado_usuario) {
        return res.status(400).json({ error: 'ID de usuario y estado de usuario son requeridos' });
    }

    let data = {
        Id_Estado_usuario: user_id,
        estado_usuario: estado_usuario
    };

    let sql = "INSERT INTO estado_usuario SET ?";
    conexion.query(sql, data, function (err, result) {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json({ error: 'Error al registrar el estado de usuario', details: err.message });
        } else {
            data.id = result.insertId; // Incluye el ID del nuevo registro
            res.status(201).json(data); // Usa el código de estado 201 para creación exitosa
        }
    });
};

// Función para verificar el número de documento
const checkNumeroDocumento = (numero_documento) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT COUNT(*) AS count FROM personal WHERE Numero_documento = ?";
        conexion.query(sql, [numero_documento], (err, results) => {
            if (err) return reject(err);
            const count = results[0].count;
            resolve(count > 0);
        });
    });
};

// Función para verificar el correo electrónico
const checkCorreo = (correo) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT COUNT(*) AS count FROM personal WHERE Correo = ?";
        conexion.query(sql, [correo], (err, results) => {
            if (err) return reject(err);
            const count = results[0].count;
            resolve(count > 0);
        });
    });
};

// Función para verificar el número de teléfono
const checkTelefono = (telefono) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT COUNT(*) AS count FROM personal WHERE Telefono = ?";
        conexion.query(sql, [telefono], (err, results) => {
            if (err) return reject(err);
            const count = results[0].count;
            resolve(count > 0);
        });
    });
};

exports.registrarPersonal = async (req, res) => {
    const {
        numero_documento, nombre, apellido, provincia, distrito, direccion, correo, telefono, contrasena, 
        foto, id_tipo_doc, id_estado_usuario, id_perfil
    } = req.body;

    // Verificar si los campos están presentes
    let errors = {};
    if (!numero_documento) errors.numero_documento = 'Número de documento es requerido';
    if (!nombre) errors.nombre = 'Nombre es requerido';
    if (!apellido) errors.apellido = 'Apellido es requerido';
    if (!provincia) errors.provincia = 'Provincia es requerida';
    if (!distrito) errors.distrito = 'Distrito es requerido';
    if (!correo) errors.correo = 'Correo electrónico es requerido';
    if (!telefono) errors.telefono = 'Teléfono es requerido';
    if (!contrasena) errors.contrasena = 'Contraseña es requerida';
    if (!id_tipo_doc) errors.id_tipo_doc = 'Tipo de documento es requerido';
    if (!id_estado_usuario) errors.id_estado_usuario = 'Estado del usuario es requerido';
    if (!id_perfil) errors.id_perfil = 'Perfil es requerido';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Verificar si ya existe algún registro con los mismos valores
        let responseErrors = {};

        const docExists = await checkNumeroDocumento(numero_documento);
        if (docExists) responseErrors.numero_documento = 'Número de documento ya está registrado';

        const correoExists = await checkCorreo(correo);
        if (correoExists) responseErrors.correo = 'Correo electrónico ya está registrado';

        const telefonoExists = await checkTelefono(telefono);
        if (telefonoExists) responseErrors.telefono = 'Número de teléfono ya está registrado';

        if (Object.keys(responseErrors).length > 0) {
            return res.status(409).json({ errors: responseErrors });
        }

        const insertSql = `
            INSERT INTO personal (
                Numero_documento, Nombre, Apellido, Provincia, Distrito, Direccion, Correo, Telefono, Contraseña, Foto, id_tipo_doc, id_estado_usuario, id_perfil
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        conexion.query(insertSql, [
            numero_documento, nombre, apellido, provincia, distrito, direccion, correo, telefono, contrasena, foto, id_tipo_doc, id_estado_usuario, id_perfil
        ], (err, results) => {
            if (err) {
                console.error('Error al insertar el registro:', err);
                return res.status(500).json({ error: 'Error al registrar el personal', details: err.message });
            }

            res.status(200).json({ message: 'Registro exitoso' });
        });

    } catch (err) {
        console.error('Error en las consultas:', err);
        res.status(500).json({ error: 'Error en las consultas', details: err.message });
    }
};


/*
exports.registrarPersonal = (req, res) => {
    console.log('Datos recibidos:', req.body);

    const { 
        numero_documento, nombre, apellido, provincia, distrito, direccion, correo, telefono, contrasena, 
        foto, id_tipo_doc, id_estado_usuario, id_perfil 
    } = req.body;

    // Verifica si los campos necesarios están presentes
    let errors = [];
   if (!numero_documento) errors.push('Número de documento es requerido');
   if (!nombre) errors.push('Nombre es requerido');
   if (!apellido) errors.push('Apellido es requerido');
   if (!provincia) errors.push('Provincia es requerida');
   if (!distrito) errors.push('Distrito es requerido');
   // (!direccion) errors.push('Dirección es requerida');
   if (!correo) errors.push('Correo electrónico es requerido');
   if (!telefono) errors.push('Teléfono es requerido');
   if (!contrasena) errors.push('Contraseña es requerida');
   //(!foto) errors.push('Foto es requerida'); // Nota: El archivo puede ser manejado de manera diferente
   if (!id_tipo_doc) errors.push('Tipo de documento es requerido');
   if (!id_estado_usuario) errors.push('Estado del usuario es requerido');
   if (!id_perfil) errors.push('Perfil es requerido');

    // Si hay errores, envíalos en la respuesta
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
    }

    let data = {
        Numero_documento: numero_documento,
        Nombre: nombre,
        Apellido: apellido,
        Provincia: provincia,
        Distrito: distrito,
        Direccion: direccion,
        Correo: correo,
        Telefono: telefono,
        Contraseña: contrasena,
        Foto: foto, // Manejo especial puede ser necesario para archivos
        ID_Tipo_Doc: id_tipo_doc,
        Id_Estado_usuario: id_estado_usuario,
        Id_Perfil: id_perfil
        
    };

    // Excluye el campo 'id' del objeto 'data'
    let sql = "INSERT INTO personal (Numero_documento, Nombre, Apellido, Provincia, Distrito, Direccion, Correo, Telefono, Contraseña, Foto, ID_Tipo_Doc, Id_Estado_usuario, Id_Perfil) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    conexion.query(sql, [
        data.Numero_documento,
        data.Nombre,
        data.Apellido,
        data.Provincia,
        data.Distrito,
        data.Direccion,
        data.Correo,
        data.Telefono,
        data.Contraseña,
        data.Foto, // Nota: Asegúrate de manejar correctamente los archivos
        data.ID_Tipo_Doc,
        data.Id_Estado_usuario,
        data.Id_Perfil
    ], function (err, result) {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json({ error: 'Error al registrar el personal', details: err.message });
        } else {
            data.id = result.insertId; // Incluye el ID del nuevo registro
            res.status(201).json(data); // Usa el código de estado 201 para creación exitosa
        }
    });
};
*/
/*
exports.modificarPersonal = (req, res) => {
    console.log('Datos recibidos para modificación:', req.body);

    const { 
        id, numero_documento, nombre, apellido, provincia, distrito, direccion, correo, telefono, contrasena, 
        foto, id_tipo_doc, id_estado_usuario, id_perfil 
    } = req.body;

    // Verifica si los campos necesarios están presentes
    let errors = [];
    //if (!id) errors.push('ID es requerido');
    if (!numero_documento) errors.push('Número de documento es requerido');
    if (!nombre) errors.push('Nombre es requerido');
    if (!apellido) errors.push('Apellido es requerido');
    if (!provincia) errors.push('Provincia es requerida');
    if (!distrito) errors.push('Distrito es requerido');
    // if (!direccion) errors.push('Dirección es requerida');
    if (!correo) errors.push('Correo electrónico es requerido');
    if (!telefono) errors.push('Teléfono es requerido');
    if (!contrasena) errors.push('Contraseña es requerida');
    // if (!foto) errors.push('Foto es requerida');
    if (!id_tipo_doc) errors.push('Tipo de documento es requerido');
    if (!id_estado_usuario) errors.push('Estado del usuario es requerido');
    if (!id_perfil) errors.push('Perfil es requerido');

    // Si hay errores, envíalos en la respuesta
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
    }

    let data = {
        Numero_documento: numero_documento,
        Nombre: nombre,
        Apellido: apellido,
        Provincia: provincia,
        Distrito: distrito,
        Direccion: direccion,
        Correo: correo,
        Telefono: telefono,
        Contraseña: contrasena,
        Foto: foto, // Nota: Asegúrate de manejar correctamente los archivos
        ID_Tipo_Doc: id_tipo_doc,
        Id_Estado_usuario: id_estado_usuario,
        Id_Perfil: id_perfil
    };

    // Construir la consulta SQL para actualizar el registro
    let sql = `UPDATE personal SET 
        Numero_documento = ?, 
        Nombre = ?, 
        Apellido = ?, 
        Provincia = ?, 
        Distrito = ?, 
        Direccion = ?, 
        Correo = ?, 
        Telefono = ?, 
        Contraseña = ?, 
        Foto = ?, 
        ID_Tipo_Doc = ?, 
        Id_Estado_usuario = ?, 
        Id_Perfil = ? 
        WHERE idPersonal = ?`;

    conexion.query(sql, [
        data.Numero_documento,
        data.Nombre,
        data.Apellido,
        data.Provincia,
        data.Distrito,
        data.Direccion,
        data.Correo,
        data.Telefono,
        data.Contraseña,
        data.Foto, // Nota: Asegúrate de manejar correctamente los archivos
        data.ID_Tipo_Doc,
        data.Id_Estado_usuario,
        data.Id_Perfil,
        id // El ID del registro que quieres modificar
    ], function (err, result) {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json({ error: 'Error al modificar el personal', details: err.message });
        } else {
            res.status(200).json({ message: 'Personal modificado correctamente', affectedRows: result.affectedRows });
        }
    });
};
*/

exports.modificarPersonal = (req, res) => {
    console.log('Datos recibidos para modificación:', req.body);

    const { 
        numero_documento, nombre, apellido, provincia, distrito, direccion, correo, telefono, contrasena, 
        foto, id_tipo_doc, id_estado_usuario, id_perfil 
    } = req.body;

    // Verifica si los campos necesarios están presentes
    let errors = [];
    if (!numero_documento) errors.push('Número de documento es requerido');
    if (!nombre) errors.push('Nombre es requerido');
    if (!apellido) errors.push('Apellido es requerido');
    if (!provincia) errors.push('Provincia es requerida');
    if (!distrito) errors.push('Distrito es requerido');
    if (!correo) errors.push('Correo electrónico es requerido');
    if (!telefono) errors.push('Teléfono es requerido');
    if (!contrasena) errors.push('Contraseña es requerida');
    if (!id_tipo_doc) errors.push('Tipo de documento es requerido');
    if (!id_estado_usuario) errors.push('Estado del usuario es requerido');
    if (!id_perfil) errors.push('Perfil es requerido');

    // Si hay errores, envíalos en la respuesta
    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
    }

    let data = {
        Nombre: nombre,
        Apellido: apellido,
        Provincia: provincia,
        Distrito: distrito,
        Direccion: direccion,
        Correo: correo,
        Telefono: telefono,
        Contraseña: contrasena,
        Foto: foto, // Nota: Asegúrate de manejar correctamente los archivos
        ID_Tipo_Doc: id_tipo_doc,
        Id_Estado_usuario: id_estado_usuario,
        Id_Perfil: id_perfil,
    };

    // Construir la consulta SQL para actualizar el registro
    let sql = `UPDATE personal SET 
        Nombre = ?, 
        Apellido = ?, 
        Provincia = ?, 
        Distrito = ?, 
        Direccion = ?, 
        Correo = ?, 
        Telefono = ?, 
        Contraseña = ?, 
        Foto = ?, 
        ID_Tipo_Doc = ?, 
        Id_Estado_usuario = ?, 
        Id_Perfil = ? 
        WHERE Numero_documento = ?`; // Usamos `Numero_documento` para buscar el registro a actualizar

    conexion.query(sql, [
        data.Nombre,
        data.Apellido,
        data.Provincia,
        data.Distrito,
        data.Direccion,
        data.Correo,
        data.Telefono,
        data.Contraseña,
        data.Foto, // Nota: Asegúrate de manejar correctamente los archivos
        data.ID_Tipo_Doc,
        data.Id_Estado_usuario,
        data.Id_Perfil,
        numero_documento // El número de documento del registro que quieres modificar
    ], function (err, result) {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json({ error: 'Error al modificar el personal', details: err.message });
        } else {
            console.log('Resultado de la consulta:', result); // Imprimir el resultado para depuración
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'No se actualizó ningún registro' });
            } else {
                res.status(200).json({ message: 'Personal modificado correctamente', affectedRows: result.affectedRows });
            }
        }
    });
};


// Función para obtener los datos de un registro específico
exports.obtenerPersonalPorId = (req, res) => {
    const idPersonal = req.params.id; // Obtener el ID desde los parámetros de la solicitud

    if (!idPersonal) {
        return res.status(400).json({ error: 'ID del personal es requerido' });
    }

    // Consulta SQL para obtener los datos del personal basado en el ID
    const sql = "SELECT * FROM personal WHERE idPersonal = ?";
    
    conexion.query(sql, [idPersonal], (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ error: 'Error al obtener los datos', details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron datos para el ID especificado' });
        }

        // Enviar los datos del registro al cliente
        res.status(200).json(results[0]);
    });
};



// Función para obtener perfiles
exports.getEstado_usuario = (req, res) => {
    const query = 'SELECT Id_Estado_usuario, estado_usuario FROM estado_usuario'; // Consulta para obtener los perfiles
    conexion.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar estado_usuario:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        res.json(results);
    });
};

// Función para obtener perfiles
exports.getPerfiles = (req, res) => {
    const query = 'SELECT ID_Perfil, Perfil FROM perfil'; // Consulta para obtener los perfiles
    conexion.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar perfiles:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        res.json(results);
    });
};

// Función para obtener perfiles
exports.getTdoc_ident = (req, res) => {
    const query = 'SELECT ID_Tipo_Doc, Documeto_identidad FROM tdoc_ident'; // Consulta para obtener los perfiles
    conexion.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar Tipo_documuneto:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        res.json(results);
    });
};


// Función para obtener todos los registros del personal
exports.obtenerPersonal = (req, res) => {
    const query = `
        SELECT
            p.idPersonal,
            T.Documeto_identidad,
            p.Numero_documento,
            p.Nombre,
            p.Apellido,
            p.Provincia,
            p.Distrito,
            p.Direccion,
            p.Correo,
            p.Telefono,
            p.Fecha_acceso,
            e.estado_usuario,
            pf.Perfil,
            p.Contraseña
        FROM personal p
        JOIN tdoc_ident T ON p.ID_Tipo_Doc = T.ID_Tipo_Doc
        JOIN estado_usuario e ON p.Id_Estado_usuario = e.Id_Estado_usuario
        JOIN perfil pf ON p.Id_Perfil = pf.ID_Perfil

    `;

    conexion.query(query, (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos:', error);
            res.status(500).send('Error en la consulta');
            return;
        }
        res.json(results); // Envía los resultados como JSON
    });
};

exports.eliminarPersonal = (req, res) => {
    const { id } = req.params; // Obtiene el ID del registro a eliminar

    const query = 'DELETE FROM personal WHERE idPersonal = ?';

    conexion.query(query, [id], (error, results) => {
        if (error) {
            console.error('Error al eliminar el registro:', error);
            res.status(500).send('Error al eliminar el registro');
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).send('No se encontró el registro con el ID proporcionado');
        } else {
            res.send('Registro eliminado correctamente');
        }
    });
};

exports.exportExcel = async (req, res) => {
    console.log('Preparando datos para exportar a Excel...');

    // Consulta SQL actualizada para incluir todos los campos
    const query = `
        SELECT
            p.idPersonal,
            t.Documeto_identidad,
            p.Numero_documento,
            p.Nombre,
            p.Apellido,
            p.Provincia,
            p.Distrito,
            p.Direccion,
            p.Correo,
            p.Telefono,
            p.Contraseña,
            p.Fecha_acceso,
            e.estado_usuario,
            pf.Perfil
        FROM personal p
        JOIN estado_usuario e ON p.Id_Estado_usuario = e.Id_Estado_usuario
        JOIN perfil pf ON p.Id_Perfil = pf.ID_Perfil
        JOIN tdoc_ident t ON p.ID_Tipo_Doc = t.ID_Tipo_Doc;

    `;

    conexion.query(query, async (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos:', error);
            res.status(500).send('Error al consultar la base de datos');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Personal');

        // Definir encabezados y ancho de columnas
        const headers = [
            { header: 'ID', key: 'idPersonal', width: 10 },
            { header: 'Documeto_identidad', key: 'Documeto_identidad', width: 30 },
            { header: 'Documento', key: 'Numero_documento', width: 20 },
            { header: 'Nombre', key: 'Nombre', width: 15 },
            { header: 'Apellido', key: 'Apellido', width: 15 },
            { header: 'Provincia', key: 'Provincia', width: 15 },
            { header: 'Distrito', key: 'Distrito', width: 15 },
            { header: 'Dirección', key: 'Direccion', width: 20 },
            { header: 'Correo', key: 'Correo', width: 30 },
            { header: 'Teléfono', key: 'Telefono', width: 15 },
            { header: 'Contraseña', key: 'Contraseña', width: 20 },
            { header: 'Fecha de Registro', key: 'Fecha_registro', width: 20 },
            { header: 'Estado', key: 'estado_usuario', width: 15 },
            { header: 'Perfil', key: 'Perfil', width: 15 }
        ];

        // Agregar encabezados a la hoja
        worksheet.columns = headers;

        // Aplicar estilos a los encabezados
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }; // Texto en negrita y color blanco
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4F81BD' } // Color de fondo del encabezado
        };
        headerRow.alignment = { horizontal: 'center' }; // Centrar el texto en el encabezado

        // Agregar datos y aplicar estilos
        results.forEach((record, index) => {
            const row = [
                record.idPersonal,
                record.Documeto_identidad,
                record.Numero_documento,
                record.Nombre,
                record.Apellido,
                record.Provincia,
                record.Distrito,
                record.Direccion,
                record.Correo,
                record.Telefono,
                record.Contraseña,
                record.Fecha_registro,
                record.estado_usuario,
                record.Perfil
            ];
            const dataRow = worksheet.addRow(row);
            dataRow.alignment = { horizontal: 'center' }; // Centrar los datos en cada celda

            // Aplicar estilos a las filas de datos
            const rowIndex = dataRow.number;
            dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: (rowIndex % 2 === 0 ? 'F2F2F2' : 'FFFFFF') } // Alternar color de fondo
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        // Ajustar el ancho de las columnas automáticamente
        worksheet.columns.forEach(column => {
            const maxLength = column.values.reduce((max, value) => {
                return Math.max(max, value ? value.toString().length : 0);
            }, 0);
            column.width = maxLength + 2; // Ajustar el ancho con un pequeño margen
        });

        // Enviar el archivo Excel directamente en la respuesta
        res.setHeader('Content-Disposition', 'attachment; filename=personal.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const buffer = await workbook.xlsx.writeBuffer();
        res.send(buffer);
    });
};

exports.exportPDF = (req, res) => {
    console.log('Preparando datos para exportar a PDF...');

    // Consulta a la base de datos
    conexion.query('SELECT * FROM personal', (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos:', error);
            res.status(500).send('Error al consultar la base de datos');
            return;
        }

        // Crear un documento PDF
        const doc = new PDFDocument();

        // Configurar respuesta para descarga
        res.setHeader('Content-disposition', 'attachment; filename=personal.pdf');
        res.setHeader('Content-type', 'application/pdf');

        // Pipe PDF into the response
        doc.pipe(res);

        // Agregar título
        doc.fontSize(16).text('Lista de Personal', {
            align: 'center'
        });

        // Agregar tabla con encabezados
        doc.moveDown();
        doc.fontSize(12);

        // Agregar encabezados
        const headers = ['ID', 'Documento', 'Nombre', 'Apellido', 'Correo', 'Teléfono', 'Fecha de Acceso', 'Perfil', 'Estado', 'Acciones'];
        const columnWidths = [50, 100, 100, 100, 150, 100, 150, 100, 100, 100];
        const rowHeight = 20;

        headers.forEach((header, index) => {
            doc.text(header, columnWidths.slice(0, index + 1).reduce((a, b) => a + b), 50, { continued: index < headers.length - 1 });
        });

        // Agregar una línea de separación
        doc.moveDown(rowHeight);
        doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();

        // Agregar filas de datos
        results.forEach(record => {
            const row = [
                record.idPersonal,
                record.Numero_documento,
                record.Nombre,
                record.Apellido,
                record.Correo,
                record.Telefono,
                record.Fecha_acceso,
                record.Perfil,
                record.Estado,
                record.Acciones
            ];

            row.forEach((field, index) => {
                doc.text(field, columnWidths.slice(0, index + 1).reduce((a, b) => a + b), doc.y, { continued: index < row.length - 1 });
            });

            doc.moveDown(rowHeight);
        });

        // Finalizar el documento PDF
        doc.end();
    });
};

