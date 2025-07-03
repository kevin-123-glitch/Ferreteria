const conexion = require('../config/conexion');

// Controlador para buscar productos por nombre o código de barras
exports.buscarProducto = (req, res) => {
    const terminoBusqueda = req.query.q; // El término de búsqueda que viene de la URL

    const query = `
    SELECT p.Id_producto, p.Codigo_barras, p.Nombre, p.Url_foto, p.Precio_V, p.Stock, m.Nombre AS Marca, u.Nombre AS Unidad
    FROM productos p
    INNER JOIN marca m ON p.Id_marca = m.Id_marca
    INNER JOIN unidades_medida u ON p.Id_unidad = u.Id_unidad
    WHERE (p.Nombre LIKE ? OR p.Codigo_barras LIKE ?)
      AND p.Stock > 0
    `;
 
    const valores = [`%${terminoBusqueda}%`, `%${terminoBusqueda}%`];

    conexion.query(query, valores, (error, resultados) => {
        if (error) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(resultados); // Devuelve los resultados en formato JSON
    });
};


// Controlador para buscar clientes por nombre o número de documento
exports.buscarCliente = (req, res) => {
    const terminoBusqueda = req.query.q; // El término de búsqueda que viene de la URL

    const query = `
    SELECT id_cliente, Numero_documento, Datos_cliente, Provincia, Distrito, Telefono, Direccion, Correo
    FROM cliente
    WHERE (Datos_cliente LIKE ? OR Numero_documento LIKE ?)
    `;

    const valores = [`%${terminoBusqueda}%`, `%${terminoBusqueda}%`];

    conexion.query(query, valores, (error, resultados) => {
        if (error) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(resultados); // Devuelve los resultados en formato JSON
    });
};


// Función para obtener la serie y el último número de documento
exports.getSerieYNumero = (req, res) => {
    const tipoDocumento = req.params.tipoDocumento;
    
    conexion.query(
        'SELECT serie, ultimoNumeroSerie, ultimoNumeroDocumento FROM documentos_comprobantes WHERE tipoDocumento = ?',
        [tipoDocumento],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener datos' });
            }

            if (results.length > 0) {
                const serie = results[0].serie; // Asegurarse de que serie se extrae correctamente
                const ultimoNumeroSerie = results[0].ultimoNumeroSerie; // Último número de serie
                
                // Verifica que las variables serie y ultimoNumeroSerie tengan valores válidos
                if (serie && ultimoNumeroSerie !== undefined) {
                    // Respuesta con la serie y el número de documento
                    res.json({  
                        serie: `${serie}${ultimoNumeroSerie.toString().padStart(3, '0')}`,  // Combina la serie con el número de serie
                        ultimoNumeroDocumento: results[0].ultimoNumeroDocumento.toString().padStart(6, '0') // Asegura 6 dígitos para el documento
                    });
                } else {
                    res.status(400).json({ error: 'Datos incompletos' });
                }
            } else {
                res.status(404).json({ error: 'Tipo de documento no encontrado' });
            }
        }
    );
};

// Función para incrementar el número de documento y actualizar la serie si es necesario
exports.incrementarDocumento = (req, res) => {
    const tipoDocumento = req.params.tipoDocumento;

    // Obtener la serie, el último número de documento y el límite
    conexion.query(
        'SELECT serie, ultimoNumeroSerie, ultimoNumeroDocumento, limite FROM documentos_comprobantes WHERE tipoDocumento = ?',
        [tipoDocumento],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error al obtener datos' });
            }

            if (results.length > 0) {
                let { serie, ultimoNumeroSerie, ultimoNumeroDocumento, limite } = results[0];

                // Convertir los valores a enteros
                let numeroDocumento = parseInt(ultimoNumeroDocumento, 10);
                let limiteNumero = parseInt(limite, 10);

                // Incrementar el número de documento
                let nuevoNumeroDocumento = numeroDocumento + 1;

                // Si el número de documento alcanza el límite, incrementar la serie y reiniciar el número de documento
                if (nuevoNumeroDocumento > limiteNumero) {
                    nuevoNumeroDocumento = 1; // Reinicia el número de documento
                    let nuevoNumeroSerie = (parseInt(ultimoNumeroSerie, 10) + 1).toString().padStart(3, '0'); // Incrementa la serie
                     
                    // Actualizar la base de datos con el nuevo número de serie y el número de documento reiniciado
                    conexion.query(
                        `UPDATE documentos_comprobantes 
                         SET ultimoNumeroSerie = ?, ultimoNumeroDocumento = ? 
                         WHERE tipoDocumento = ?`,
                        [nuevoNumeroSerie, nuevoNumeroDocumento.toString().padStart(3, '0'), tipoDocumento],
                        (updateErr) => {
                            if (updateErr) {
                                return res.status(500).json({ error: 'Error al actualizar los datos' });
                            }

                            // Devolver la nueva serie y el nuevo número de documento
                            res.json({
                                serie: `${serie}${nuevoNumeroSerie}`,
                                ultimoNumeroDocumento: nuevoNumeroDocumento.toString().padStart(6, '0')
                            });
                        }
                    );
                } else {
                    // Solo actualizar el número de documento sin cambiar la serie
                    conexion.query(
                        `UPDATE documentos_comprobantes 
                         SET ultimoNumeroDocumento = ? 
                         WHERE tipoDocumento = ?`,
                        [nuevoNumeroDocumento.toString().padStart(6, '0'), tipoDocumento],
                        (updateErr) => {
                            if (updateErr) {
                                return res.status(500).json({ error: 'Error al actualizar los datos' });
                            }

                            // Devolver la serie y el nuevo número de documento
                            res.json({
                                serie: `${serie}${ultimoNumeroSerie.toString().padStart(3, '0')}`,  // Combina la serie con el número de serie
                                ultimoNumeroDocumento: nuevoNumeroDocumento.toString().padStart(6, '0')
                            });
                        }
                    );
                }
            } else {
                res.status(404).json({ error: 'Tipo de documento no encontrado' });
            }
        }
    );
};
 
exports.registrarVenta = async (req, res) => {
    const {
        Id_documentos_comprobantes, Serie, Correlativo, id_cliente,
        Id_tipo_pago, Porcentaje_descuento, Fecha_registro, SubTotal, Igv,
        Descuento, Total, detalles
    } = req.body;

    // Validar campos obligatorios
    let errors = {};
    if (!Id_documentos_comprobantes) errors.Id_documentos_comprobantes = 'Id de documentos comprobantes es requerido';
    if (!Serie) errors.Serie = 'Serie es requerida';
    if (!Correlativo) errors.Correlativo = 'Número de Correlativo  de la serie es requerido';
    if (!id_cliente) errors.id_proveedor = 'Id de del cliente es requerido';
    if (!Id_tipo_pago) errors.Id_tipo_pago = 'Id de tipo de pago es requerido';
    if (!Fecha_registro) errors.Fecha_registro = 'Fecha de registro es requerida';
    if (!SubTotal) errors.SubTotal = 'Subtotal es requerido';
    if (!Igv) errors.Igv = 'IGV es requerido';
    if (!Total) errors.Total = 'Total es requerido';

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Verificar que el proveedor existe
        const clienteExists = await new Promise((resolve, reject) => {
            conexion.query('SELECT 1 FROM cliente WHERE id_cliente = ?', [id_cliente], (err, results) => {
                if (err) return reject(err);
                resolve(results.length > 0);
            });
        });

        if (!clienteExists) {
            return res.status(400).json({ error: 'El cliente especificado no existe' });
        }

        // Iniciar la transacción
        conexion.beginTransaction(async (err) => {
            if (err) {
                console.error('Error al iniciar la transacción:', err);
                return res.status(500).json({ error: 'Error al iniciar la transacción' });
            }

            // Insertar en la tabla compras
            const insertCompraSql = `INSERT INTO ventas (Id_documentos_comprobantes, Serie, Correlativo, id_cliente, Id_tipo_pago, Porcentaje_descuento, Fecha_registro, SubTotal, Igv, Descuento, Total) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            conexion.query(insertCompraSql, [
                Id_documentos_comprobantes, Serie, Correlativo, id_cliente, Id_tipo_pago, Porcentaje_descuento, Fecha_registro, SubTotal, Igv, Descuento, Total
            ], (err, results) => {
                if (err) {
                    console.error('Error al insertar en la tabla compras:', err);
                    return conexion.rollback(() => {
                        res.status(500).json({ error: 'Error al insertar en la tabla compras', details: err.message });
                    });
                }

                const Id_venta = results.insertId; // Obtener el ID de la compra recién insertada

                // Procesar las inserciones de detalles y actualización de stock
                const detalleQueries = detalles.map(detalle => {
                    return new Promise((resolve, reject) => {
                        // Actualizar stock
                        const updateStockSql = `UPDATE productos SET Stock = Stock - ? WHERE Id_producto = ?`;
                        conexion.query(updateStockSql, [detalle.Cantidad, detalle.Id_producto], (err) => {
                            if (err) return reject(err);

                            // Insertar en detalles_compras
                            const insertDetalleSql = `INSERT INTO detalles_ventas (Id_venta, Id_producto, Cantidad, Precio, Importe, Descuento) VALUES (?, ?, ?, ?, ?, ?)`;
                            conexion.query(insertDetalleSql, [
                                Id_venta, detalle.Id_producto, detalle.Cantidad, detalle.Precio, detalle.Importe, detalle.Descuento
                            ], (err) => {
                                if (err) return reject(err);
                                resolve();
                            });
                        });
                    });
                });

                // Ejecutar todas las inserciones de detalles en paralelo
                Promise.all(detalleQueries)
                    .then(() => {
                        conexion.commit((err) => {
                            if (err) {
                                console.error('Error al confirmar la transacción:', err);
                                return conexion.rollback(() => {
                                    res.status(500).json({ error: 'Error al confirmar la transacción', details: err.message });
                                });
                            }
                            res.status(201).json({ message: 'Venta registrada correctamente' });
                        });
                    })
                    .catch(err => {
                        conexion.rollback(() => {
                            console.error('Error al insertar en detalles_venta:', err);
                            res.status(500).json({ error: 'Error al insertar en detalles_venta', details: err.message });
                        });
                    });
            });
        });
    } catch (err) {
        console.error('Error en las consultas:', err);
        res.status(500).json({ error: 'Error en las consultas', details: err.message });
    }
};

exports.Ventas = (req, res) => {
    const { fechaInicio, fechaFin } = req.query;

    let query = `
        SELECT 
            v.Id_venta, 
            dc.tipoDocumento AS Tipo_Documento_Comprobante,
            CONCAT(v.Serie, '-', v.Correlativo) AS Documento_Venta,
            p.Datos_cliente,
            tp.Valor AS Metodo_Pago,
            CONCAT(v.Porcentaje_descuento, ' %') AS Porcentaje_Descuento,
            v.Fecha_registro,
            v.SubTotal,
            v.Igv,
            v.Descuento,
            v.Total
        FROM 
            ventas v
        JOIN 
            documentos_comprobantes dc ON v.Id_documentos_comprobantes = dc.Id_documentos_comprobantes
        JOIN 
            cliente p ON v.Id_cliente = p.id_cliente
        JOIN 
            tipo_pago tp ON v.Id_tipo_pago = tp.Id_tipo_pago
        WHERE
            v.Fecha_registro BETWEEN ? AND ?;
    `;

    conexion.query(query, [fechaInicio, fechaFin], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// Controlador para obtener los detalles de una compra según su Id
exports.DetallesVentas = (req, res) => {
    const Id_venta = req.params.Id_venta; // Obtenemos el Id de la compra de los parámetros de la URL
    
    // Consulta a la base de datos
    const query = `
    SELECT 
        dv.Id_detalles_venta,
        p.Codigo_barras,
        p.Nombre AS nombre_producto,
        dv.Cantidad,
        dv.Precio,
        dv.Importe,
        u.Nombre AS medida, 
        m.Nombre AS marca,
        dv.Descuento
    FROM 
        detalles_ventas dv
    JOIN 
        productos p ON dv.Id_producto = p.Id_producto
    JOIN 
        marca m ON p.Id_marca = m.Id_marca
    JOIN 
        unidades_medida u ON p.Id_unidad = u.Id_unidad
    WHERE 
        dv.Id_venta = ?;
    `;

    // Ejecutamos la consulta
    conexion.query(query, [Id_venta], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron detalles para esta venta' });
        }

        // Enviar los resultados como respuesta
        res.json(results);
    });
};

