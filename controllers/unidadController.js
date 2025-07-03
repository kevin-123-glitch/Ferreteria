const conexion = require('../config/conexion');

const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');


exports.obtenerSiguienteId = (req, res) => {
    const query = 'SELECT MAX(Id_unidad) AS ultimo_id FROM unidades_medida';

    conexion.query(query, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Error al obtener el ID' });
            return;
        }

        const ultimoId = results[0].ultimo_id;
        const siguienteId = ultimoId ? ultimoId + 1 : 1;

        res.json({ siguienteId });
    });
};

// Función para verificar el número de documento
const checkNombre = (nombre) => {
    return new Promise((resolve, reject) => {
        if (!nombre.trim()) {
            // Si el número de documento está vacío, considera que no existe
            return resolve(false);
        }

        const sql = "SELECT COUNT(*) AS count FROM unidades_medida WHERE Nombre = ? AND Nombre IS NOT NULL";
        conexion.query(sql, [nombre], (err, results) => {
            if (err) return reject(err);
            const count = results[0].count;
            resolve(count > 0); // Devuelve true si existe, false si no
        });
    });
};


// Función para registrar un nuevo cliente
exports.registrarUnidad = async (req, res) => {
    const {
        id_unidad, nombre, descripcion, observaciones
    } = req.body;

    // Verificar si los campos obligatorios están presentes
    let errors = {};
    if (!nombre) errors.nombre = 'El Nombre de la unidad de medidad es requerida';


    // Si hay errores en los campos obligatorios, devolver respuesta con errores
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Verificación de duplicados en la base de datos
        let responseErrors = {};

        const docExists = await checkNombre(nombre);
        if (docExists) responseErrors.nombre = 'El nombre del a unidad de medida ya está registrado';

        // Si hay errores de duplicado, devolver respuesta con errores
        if (Object.keys(responseErrors).length > 0) {
            return res.status(409).json({ errors: responseErrors });
        }

        // Insertar el nuevo registro si no hay errores
        const insertSql = `INSERT INTO unidades_medida (Id_unidad, nombre, descripcion) VALUES (?, ?, ?)`;
        conexion.query(insertSql, [
            id_unidad, nombre, descripcion, observaciones
        ], (err, results) => {
            if (err) {
                console.error('Error al insertar el registro:', err);
                return res.status(500).json({ error: 'Error al registrar la unidad de medida', details: err.message });
            }

            res.status(200).json({ message: 'Registro exitoso' });
        });

    } catch (err) {
        console.error('Error en las consultas:', err);
        res.status(500).json({ error: 'Error en las consultas', details: err.message });
    }
};


exports.modificarUnidad = (req, res) => {
    console.log('Datos recibidos para modificación:', req.body);

    const {
        id_unidad, nombre, descripcion
    } = req.body;

    // Verifica si los campos necesarios están presentes
    let errors = {};
    if (!nombre) errors.nombre = 'El Nombre de la unidad es requerido';

    // Si hay errores, envíalos en la respuesta
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: Object.values(errors).join(', ') });
    }

    let data = {
        Id_unidad: id_unidad,
        Nombre: nombre,
        Descripcion: descripcion,
    };

    // Construir la consulta SQL para actualizar el registro
    let sql = `UPDATE unidades_medida SET 
        Id_unidad = ?, 
        Nombre = ?, 
        Descripcion = ?
        WHERE Id_unidad = ?`; // Usamos `Numero_documento` para buscar el registro a actualizar

    conexion.query(sql, [
        data.Id_unidad,
        data.Nombre,
        data.Descripcion,
        id_unidad // El número de documento del registro que quieres modificar

    ], function (err, result) {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json({ error: 'Error al modificar la unidad de medida', details: err.message });
        } else {
            console.log('Resultado de la consulta:', result); // Imprimir el resultado para depuración
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'No se actualizó ningún registro' });
            } else {
                res.status(200).json({ message: 'Inidad de medida modificada correctamente', affectedRows: result.affectedRows });
            }
        }
    });
};

// Función para obtener todos los registros de la categoria
exports.obtenerUnidad = (req, res) => {
    const query = `
       SELECT
       Id_unidad,
       Nombre,
       Descripcion
       FROM unidades_medida;

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

exports.eliminarUnidad= (req, res) => {
    const { id } = req.params; // Obtiene el ID del registro a eliminar

    const query = 'DELETE FROM unidades_medida WHERE Id_unidad = ?';

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
        Id_unidad,
        Nombre,
        Descripcion
        FROM unidades_medida;
    `;

    conexion.query(query, async (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos:', error);
            res.status(500).send('Error al consultar la base de datos');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('categoria');

        // Definir encabezados y ancho de columnas
        const headers = [
            { header: 'ID', key: 'Id_unidad', width: 10 },
            { header: 'Unidad', key: 'Nombre', width: 20 },
            { header: 'Descripcion', key: 'Descripcion', width: 20 },

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
                record.Id_unidad,
                record.Nombre,
                record.Descripcion,
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
        res.setHeader('Content-Disposition', 'attachment; filename=unidad.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const buffer = await workbook.xlsx.writeBuffer();
        res.send(buffer);
    });
};
