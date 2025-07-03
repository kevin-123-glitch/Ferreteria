const conexion = require('../config/conexion');

const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');


exports.obtenerSiguienteId = (req, res) => {
    const query = 'SELECT MAX(Id_producto) AS ultimo_id FROM productos';

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

exports.verificarCodigo = (req, res) => {
    const { codigo } = req.body;
    console.log('Código recibido:', codigo);  // Añade este log para depuración

    const query = 'SELECT * FROM productos WHERE Codigo_barras = ?';
    conexion.query(query, [codigo], (err, result) => {
        if (err) {
            console.error('Error al ejecutar la consulta:', err);  // Log del error en la consulta
            return res.status(500).json({ error: 'Error al verificar el código de barras' });
        }

        if (result.length > 0) {
            return res.status(409).json({ exists: true, message: 'El código de barras ya existe' });
        } else {
            return res.status(200).json({ exists: false });
        }
    });
};


// Función para verificar el número de documento
const checkCodigo_barras = (codigo_barras) => {
    return new Promise((resolve, reject) => {
        if (!codigo_barras.trim()) {
            // Si el código de barras está vacío, considera que no existe
            return resolve(false);
        }

        const sql = "SELECT COUNT(*) AS count FROM productos WHERE Codigo_barras = ? AND Codigo_barras IS NOT NULL";
        conexion.query(sql, [codigo_barras], (err, results) => {
            if (err) return reject(err);
            const count = results[0].count;
            resolve(count > 0); // Devuelve true si existe, false si no
        });
    });
};

// Función para registrar un nuevo producto
exports.registrarProducto = async (req, res) => {
    const {
        codigo_barras, id_categoria, id_marca, id_unidad, nombre, descripcion, precio_c,precio_v, stock_minimo, stock_maximo, ubicacion, fecha_caducidad, url_foto
    } = req.body;

    // Verificar si los campos obligatorios están presentes
    let errors = {};
    if (!codigo_barras) errors.codigo_barras = 'El código de barras está vacío';

    // Si hay errores en los campos obligatorios, devolver respuesta con errores
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Verificación de duplicados en la base de datos
        let responseErrors = {};

        const docExists = await checkCodigo_barras(codigo_barras);
        if (docExists) responseErrors.codigo_barras = 'El código de barras ya existe';

        // Si hay errores de duplicado, devolver respuesta con errores
        if (Object.keys(responseErrors).length > 0) {
            return res.status(409).json({ errors: responseErrors });
        }

        // Insertar el nuevo registro si no hay errores
        const insertSql = `INSERT INTO productos (Codigo_barras, Id_categoria, Id_marca, Id_unidad, Nombre, Descripcion, Precio_C, Precio_V, Stock_minimo, Stock_maximo, Ubicacion, Fecha_caducidad, Url_foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        conexion.query(insertSql, [
            codigo_barras, id_categoria, id_marca, id_unidad, nombre, descripcion, precio_c, precio_v, stock_minimo, stock_maximo, ubicacion, fecha_caducidad, url_foto
        ], (err, results) => {
            if (err) {
                console.error('Error al insertar el registro:', err);
                return res.status(500).json({ error: 'Error al registrar el producto', details: err.message });
            }

            res.status(200).json({ message: 'Registro exitoso' });
        });

    } catch (err) {
        console.error('Error en las consultas:', err);
        res.status(500).json({ error: 'Error en las consultas', details: err.message });
    }
};


// Función para obtener perfiles
exports.Combo_categoria = (req, res) => {
    const query = 'SELECT Id_categoria, Nombre FROM categorias'; // Consulta para obtener los perfiles
    conexion.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar la categoria:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        res.json(results);
    });
};
// Función para obtener perfiles
exports.Combo_marca = (req, res) => {
    const query = 'SELECT Id_marca, Nombre FROM marca'; // Consulta para obtener los perfiles
    conexion.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar la marca:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        res.json(results);
    });
};

// Función para obtener perfiles
exports.Combo_unidad = (req, res) => {
    const query = 'SELECT Id_unidad, Nombre FROM unidades_medida'; // Consulta para obtener los perfiles
    conexion.query(query, (err, results) => {
        if (err) {
            console.error('Error al consultar la unidad de medida:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        res.json(results);
    });
};



exports.modificarProducto = (req, res) => {
    console.log('Datos recibidos para modificación:', req.body);

    const {
        id_producto,codigo_barras, id_categoria, id_marca, id_unidad, nombre, descripcion, precio_c, precio_v, stock, stock_minimo, stock_maximo, ubicacion, fecha_caducidad, url_foto
    } = req.body;

    // Verifica si los campos necesarios están presentes
    let errors = {};
    if (!nombre) errors.nombre = 'El Nombre de la marca es requerido';

    // Si hay errores, envíalos en la respuesta
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: Object.values(errors).join(', ') });
    }

    let data = {
        Id_producto:id_producto,
        Codigo_barras:codigo_barras, 
        Id_categoria:id_categoria, 
        Id_marca:id_marca, 
        Id_unidad:id_unidad, 
        Nombre:nombre, 
        Descripcion:descripcion, 
        Precio_C:precio_c, 
        Precio_V:precio_v, 
        Stock:stock, 
        Stock_minimo:stock_minimo, 
        Stock_maximo:stock_maximo, 
        Ubicacion:ubicacion, 
        Fecha_caducidad:fecha_caducidad, 
        Url_foto:url_foto,
    };

    // Construir la consulta SQL para actualizar el registro
    let sql = ` UPDATE productos SET
        Codigo_barras = ?, 
        Id_categoria = ?, 
        Id_marca = ?, 
        Id_unidad = ?, 
        Nombre = ?, 
        Descripcion = ?, 
        Precio_C = ?, 
        Precio_V = ?, 
        Stock_minimo = ?, 
        Stock_maximo = ?, 
        Ubicacion = ?, 
        Fecha_caducidad = ?, 
        Url_foto = ?
        WHERE Id_producto = ?`; // Usamos `Numero_documento` para buscar el registro a actualizar

    conexion.query(sql, [
        data.Codigo_barras,
        data.Id_categoria,
        data.Id_marca,
        data.Id_unidad,
        data.Nombre,
        data.Descripcion,
        data.Precio_C,
        data.Precio_V,
        data.Stock_minimo,
        data.Stock_maximo,
        data.Ubicacion,
        data.Fecha_caducidad,
        data.Url_foto,
        id_producto // El número de documento del registro que quieres modificar

    ], function (err, result) {
        if (err) {
            console.error('Error en la consulta:', err);
            res.status(500).json({ error: 'Error al modificar el producto', details: err.message });
        } else {
            console.log('Resultado de la consulta:', result); // Imprimir el resultado para depuración
            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'No se actualizó ningún registro' });
            } else {
                res.status(200).json({ message: 'Marca modificada correctamente', affectedRows: result.affectedRows });
            }
        }
    });
};

// Función para obtener todos los registros de la categoria
exports.obtenerProducto = (req, res) => {
    const query = `
      SELECT 
      p.Id_producto,
      p.Codigo_barras,
      c.Nombre AS categoria,
      m.Nombre AS marca,
      u.Nombre AS Unidad,
      p.Nombre AS Nombre_Producto,
      p.Descripcion AS Descripcion_Producto,
      p.Precio_C,
      p.Precio_V,
      p.Stock,
      p.Stock_minimo,
      p.Stock_maximo,
      p.Ubicacion,
      p.Fecha_caducidad,
      p.Url_foto
      FROM productos p
      INNER JOIN categorias c ON p.Id_categoria = c.Id_categoria
      INNER JOIN marca m ON p.Id_marca = m.Id_marca
      INNER JOIN unidades_medida u ON p.Id_unidad = u.Id_unidad
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

exports.eliminarProducto = (req, res) => {
    const { id } = req.params; // Obtiene el ID del registro a eliminar

    const query = 'DELETE FROM productos WHERE Id_producto = ?';

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
/*
exports.exportExcel = async (req, res) => {
    console.log('Preparando datos para exportar a Excel...');

    // Consulta SQL actualizada para incluir todos los campos
    const query = `
      SELECT 
      p.Id_producto,
      p.Codigo_barras,
      c.Nombre AS Categoria,
      m.Nombre AS Marca,
      u.Nombre AS Unidad,
      p.Nombre AS Nombre_Producto,
      p.Descripcion AS Descripcion_Producto,
      p.Precio_C,
      p.Precio_V,
      p.Stock,
      p.Stock_minimo,
      p.Stock_maximo,
      p.Ubicacion,
      p.Fecha_caducidad,
      p.Url_foto
      FROM productos p
      INNER JOIN categorias c ON p.Id_categoria = c.Id_categoria
      INNER JOIN marca m ON p.Id_marca = m.Id_marca
      INNER JOIN unidades_medida u ON p.Id_unidad = u.Id_unidad
    `;

    conexion.query(query, async (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos:', error);
            res.status(500).send('Error al consultar la base de datos');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('marca');

        // Definir encabezados y ancho de columnas
        const headers = [
            { header: 'ID', key: 'Id_producto', width: 10 },
            { header: 'Codigo de barras', key: 'Codigo_barras', width: 30 },
            { header: 'Categoria', key: 'Categoria', width: 50 },
            { header: 'Marca', key: 'Marca', width: 37 },
            { header: 'Unidad', key: 'Unidad', width: 28 },
            { header: 'Producto', key: 'Nombre_Producto', width: 45 },
            { header: 'Descripcion', key: 'Descripcion_Producto', width: 100 },
            { header: 'Pre. de compra', key: 'Precio_C', width: 15 },
            { header: 'Pre. de venta', key: 'Precio_V', width: 15 },
            { header: 'Stock', key: 'Stock', width: 15 },
            { header: 'Stock_minimo', key: 'Stock_minimo', width: 15 },
            { header: 'Stock_maximo', key: 'Stock_maximo', width: 15 },
            { header: 'Ubicacion', key: 'Ubicacion', width: 35 },
            { header: 'Fecha_caducidad', key: 'Fecha_caducidad', width: 22 },

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
                record.Id_producto,
                record.Codigo_barras,
                record.Categoria,
                record.Marca,
                record.Unidad,
                record.Nombre_Producto,
                record.Descripcion_Producto,
                record.Precio_C,
                record.Precio_V,
                record.Stock,
                record.Stock_minimo,
                record.Stock_maximo,
                record.Ubicacion,
                record.Fecha_caducidad,

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
        res.setHeader('Content-Disposition', 'attachment; filename=producto.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const buffer = await workbook.xlsx.writeBuffer();
        res.send(buffer);
    });
};
*/

exports.exportExcel = async (req, res) => {
    console.log('Preparando datos para exportar a Excel...');

    // Consulta SQL actualizada para incluir todos los campos
    const query = `
      SELECT 
      p.Id_producto,
      p.Codigo_barras,
      c.Nombre AS Categoria,
      m.Nombre AS Marca,
      u.Nombre AS Unidad,
      p.Nombre AS Nombre_Producto,
      p.Descripcion AS Descripcion_Producto,
      p.Precio_C,
      p.Precio_V,
      p.Stock,
      p.Stock_minimo,
      p.Stock_maximo,
      p.Ubicacion,
      p.Fecha_caducidad,
      p.Url_foto
      FROM productos p
      INNER JOIN categorias c ON p.Id_categoria = c.Id_categoria
      INNER JOIN marca m ON p.Id_marca = m.Id_marca
      INNER JOIN unidades_medida u ON p.Id_unidad = u.Id_unidad
    `;

    conexion.query(query, async (error, results) => {
        if (error) {
            console.error('Error al consultar la base de datos:', error);
            res.status(500).send('Error al consultar la base de datos');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('marca');

        // Definir encabezados y ancho de columnas
        const headers = [
            { header: 'ID', key: 'Id_producto', width: 10 },
            { header: 'Codigo de barras', key: 'Codigo_barras', width: 30 },
            { header: 'Categoria', key: 'Categoria', width: 50 },
            { header: 'Marca', key: 'Marca', width: 37 },
            { header: 'Unidad', key: 'Unidad', width: 28 },
            { header: 'Producto', key: 'Nombre_Producto', width: 45 },
            { header: 'Descripcion', key: 'Descripcion_Producto', width: 100 },
            { header: 'Pre. de compra', key: 'Precio_C', width: 15 },
            { header: 'Pre. de venta', key: 'Precio_V', width: 15 },
            { header: 'Stock', key: 'Stock', width: 15 },
            { header: 'Stock minimo', key: 'Stock_minimo', width: 15 },
            { header: 'Stock maximo', key: 'Stock_maximo', width: 15 },
            { header: 'Ubicacion', key: 'Ubicacion', width: 35 },
            { header: 'Fecha caducidad', key: 'Fecha_caducidad', width: 22 },
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
        results.forEach((record) => {
            const row = [
                record.Id_producto,
                record.Codigo_barras,
                record.Categoria,
                record.Marca,
                record.Unidad,
                record.Nombre_Producto,
                record.Descripcion_Producto || '--',
                record.Precio_C,
                record.Precio_V,
                record.Stock || '--',
                record.Stock_minimo,
                record.Stock_maximo,
                record.Ubicacion || '--',
                record.Fecha_caducidad|| '--',
            ];
            const dataRow = worksheet.addRow(row);
            dataRow.alignment = { horizontal: 'center' }; // Centrar los datos en cada celda

            // Determinar color de fondo basado en el stock
            if (record.Stock !== null && record.Stock !== '' && record.Stock <= record.Stock_minimo && record.Stock >= 0) {
                dataRow.eachCell({ includeEmpty: true }, (cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFCCCC' } // Color de fondo rojo claro para advertencia
                    };
                });
            }

            // Aplicar estilos a las filas de datos
            dataRow.eachCell({ includeEmpty: true }, (cell) => {
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
        res.setHeader('Content-Disposition', 'attachment; filename=productos.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const buffer = await workbook.xlsx.writeBuffer();
        res.send(buffer);
    });
};


// Función para obtener productos con bajo stock
exports.getLowStockProducts = (req, res) => {
    const query = `
        SELECT Nombre, Codigo_barras,Stock,Url_foto
        FROM productos
        WHERE CAST(Stock AS UNSIGNED) <= Stock_minimo
    `;

    conexion.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la consulta.' });
        }
        res.json(results);
    });
};
