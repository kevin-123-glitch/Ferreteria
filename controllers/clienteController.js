const conexion = require('../config/conexion');

const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');



// Función para verificar el número de documento
const checkNumeroDocumento = (numero_documento) => {
    return new Promise((resolve, reject) => {
        if (!numero_documento.trim()) {
            // Si el número de documento está vacío, considera que no existe
            return resolve(false);
        }

        const sql = "SELECT COUNT(*) AS count FROM cliente WHERE Numero_documento = ? AND Numero_documento IS NOT NULL";
        conexion.query(sql, [numero_documento], (err, results) => {
            if (err) return reject(err);
            const count = results[0].count;
            resolve(count > 0); // Devuelve true si existe, false si no
        });
    });
};

// Función para verificar el correo electrónico
const checkCorreo = (correo) => {
    return new Promise((resolve, reject) => {
        if (!correo.trim()) {
            // Si el correo está vacío, considera que no existe
            return resolve(false);
        }

        const sql = "SELECT COUNT(*) AS count FROM cliente WHERE Correo = ? AND Correo IS NOT NULL";
        conexion.query(sql, [correo], (err, results) => {
            if (err) return reject(err);
            const count = results[0].count;
            resolve(count > 0); // Devuelve true si existe, false si no
        });
    });
};

// Función para verificar el número de teléfono
const checkTelefono = (telefono) => {
    return new Promise((resolve, reject) => {
        if (!telefono.trim()) {
            // Si el teléfono está vacío, considera que no existe
            return resolve(false);
        }

        const sql = "SELECT COUNT(*) AS count FROM cliente WHERE Telefono = ? AND Telefono IS NOT NULL";
        conexion.query(sql, [telefono], (err, results) => {
            if (err) return reject(err);
            const count = results[0].count;
            resolve(count > 0); // Devuelve true si existe, false si no
        });
    });
};

// Función para registrar un nuevo cliente
exports.registrarCliente = async (req, res) => {
    const {
        Id_tdoc_cliente, numero_documento, nombre, provincia, distrito, telefono, direccion, correo
    } = req.body;

    // Verificar si los campos obligatorios están presentes
    let errors = {};
    if (!Id_tdoc_cliente) errors.Id_tdoc_cliente = 'Tipo de documento es requerido';
    if (!numero_documento) errors.numero_documento = 'Número de documento es requerido';
    if (!nombre) errors.nombre = 'Nombre es requerido';

    // Si hay errores en los campos obligatorios, devolver respuesta con errores
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Verificación de duplicados en la base de datos
        let responseErrors = {};

        const docExists = await checkNumeroDocumento(numero_documento);
        if (docExists) responseErrors.numero_documento = 'Número de documento ya está registrado';

        const correoExists = await checkCorreo(correo);
        if (correoExists) responseErrors.correo = 'Correo electrónico ya está registrado';

        const telefonoExists = await checkTelefono(telefono);
        if (telefonoExists) responseErrors.telefono = 'Número de teléfono ya está registrado';

        // Si hay errores de duplicado, devolver respuesta con errores
        if (Object.keys(responseErrors).length > 0) {
            return res.status(409).json({ errors: responseErrors });
        }

        // Insertar el nuevo registro si no hay errores
        const insertSql = `INSERT INTO cliente (ID_Tipo_Doc, Numero_documento, Datos_cliente, Provincia, Distrito, Telefono, Direccion, Correo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        conexion.query(insertSql, [
            Id_tdoc_cliente, numero_documento, nombre, provincia, distrito, telefono, direccion, correo
        ], (err, results) => {
            if (err) {
                console.error('Error al insertar el registro:', err);
                return res.status(500).json({ error: 'Error al registrar el cliente', details: err.message });
            }

            res.status(200).json({ message: 'Registro exitoso' });
        });

    } catch (err) {
        console.error('Error en las consultas:', err);
        res.status(500).json({ error: 'Error en las consultas', details: err.message });
    }
};


exports.modificarCliente = (req, res) => {
    console.log('Datos recibidos para modificación:', req.body);

    const { 
        Id_tdoc_cliente, numero_documento, nombre, provincia, distrito, telefono,direccion, correo
    } = req.body;

    // Verifica si los campos necesarios están presentes
    let errors = {};
    if (!Id_tdoc_cliente) errors.Id_tdoc_cliente = 'Tipo de documento es requerido';
    if (!numero_documento) errors.numero_documento = 'Número de documento es requerido';
    if (!nombre) errors.nombre = 'Nombre es requerido';

    // Si hay errores, envíalos en la respuesta
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: Object.values(errors).join(', ') });
    }

    let data = {
        ID_Tipo_Doc: Id_tdoc_cliente,
        Numero_documento: numero_documento,
        Nombre: nombre,
        Provincia: provincia,
        Distrito: distrito,
        Telefono: telefono,
        Direccion: direccion,
        Correo: correo,
    };

    // Construir la consulta SQL para actualizar el registro
    let sql = `UPDATE cliente SET 
        ID_Tipo_Doc = ?, 
        Numero_documento = ?, 
        Datos_cliente = ?, 
        Provincia = ?, 
        Distrito = ?, 
        Telefono = ?,
        Direccion = ?, 
        Correo = ?
        WHERE Numero_documento = ?`; // Usamos `Numero_documento` para buscar el registro a actualizar

    conexion.query(sql, [
        data.ID_Tipo_Doc,
        data.Numero_documento,
        data.Nombre,
        data.Provincia,
        data.Distrito,
        data.Telefono,
        data.Direccion,
        data.Correo,
        numero_documento // El número de documento del registro que quieres modificar
    ], function (err, result) {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json({ error: 'Error al modificar el cliente', details: err.message });
        } else {
            console.log('Resultado de la consulta:', result); // Imprimir el resultado para depuración
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'No se actualizó ningún registro' });
            } else {
                res.status(200).json({ message: 'Cliente modificado correctamente', affectedRows: result.affectedRows });
            }
        }
    });
};






// Función para obtener todos los registros del personal
exports.obtenerCliente = (req, res) => {
    const query = `
       SELECT
       c.id_cliente,
       t.Documeto_identidad,
       c.Numero_documento,
       c.Datos_cliente ,
       c.Provincia,
       c.Distrito,
       c.Telefono,
       c.Direccion,
       c.Correo
       FROM cliente c
       JOIN tdoc_ident t ON c.ID_Tipo_Doc = t.ID_Tipo_Doc;

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
exports.eliminarCliente = (req, res) => {
    const { id } = req.params; // Obtiene el ID del registro a eliminar

    const query = 'DELETE FROM cliente WHERE id_cliente = ?';

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
         c.id_cliente,
         t.Documeto_identidad,
         c.numero_documento,
         c.Datos_cliente ,
         c.provincia,
         c.distrito,
         c.Telefono,
         c.Direccion,
         c.Correo
         FROM cliente c
         JOIN tdoc_ident t ON c.ID_Tipo_Doc = t.ID_Tipo_Doc
    `;

    conexion.query(query, async (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos:', error);
            res.status(500).send('Error al consultar la base de datos');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('cliente');

        // Definir encabezados y ancho de columnas
        const headers = [
            { header: 'ID', key: 'id_cliente', width: 10 },
            { header: 'Tipo', key: 'Documeto_identidad', width: 20 },
            { header: 'Documento', key: 'numero_documento', width: 20 },
            { header: 'Datos', key: 'Datos_cliente', width: 15 },
            { header: 'Provincia', key: 'provincia', width: 15 },
            { header: 'Distrito', key: 'distrito', width: 15 },
            { header: 'Telefono', key: 'Telefono', width: 15 },
            { header: 'Dirección', key: 'Direccion', width: 20 },
            { header: 'Correo', key: 'Correo', width: 30 },

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
                record.id_cliente,
                record.Documeto_identidad,
                record.numero_documento, // Asegúrate de que este sea el nombre correcto
                record.Datos_cliente,
                record.provincia, // Asegúrate de que este sea el nombre correcto
                record.distrito, // Asegúrate de que este sea el nombre correcto
                record.Telefono,
                record.Direccion,
                record.Correo,

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
        res.setHeader('Content-Disposition', 'attachment; filename=cliente.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const buffer = await workbook.xlsx.writeBuffer();
        res.send(buffer);
    });
};
// Función para obtener perfiles
exports.getTdoc_ident = (req, res) => {
    const query = `
        SELECT ID_Tipo_Doc, Documeto_identidad 
        FROM tdoc_ident 
        WHERE Documeto_identidad LIKE 'D%' 
           OR Documeto_identidad LIKE 'R%';
    `;

    conexion.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar tipoDoc:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        res.json(results);
    });
};

