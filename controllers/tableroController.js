const db = require('../config/conexion'); // Ajusta la ruta si es necesario

// Obtener el total de productos en la tabla
exports.getTotalProductos = (req, res) => {
    db.query(`
        SELECT COUNT(*) AS total_productos
        FROM productos;
    `, (error, results) => {
        if (error) {
            console.error('Error al obtener el total de productos:', error);
            return res.status(500).json({ message: 'Error al obtener el total de productos' });
        }
        res.json(results[0]);
    });
};

// Obtener ingreso diario
exports.getIngresoDiario = (req, res) => {
    db.query(`
        SELECT SUM(CAST(Total AS DECIMAL(10,2))) AS total_ingreso_diario
        FROM ventas
        WHERE DATE(Fecha_registro) = CURDATE();
    `, (error, results) => {
        if (error) {
            console.error('Error al obtener ingresos diarios:', error);
            return res.status(500).json({ message: 'Error al obtener ingresos diarios' });
        }
        res.json(results[0]);
    });
};

// Obtener egreso diario
exports.getEgresoDiario = (req, res) => {
    db.query(`
        SELECT SUM(CAST(Total AS DECIMAL(10,2))) AS total_egreso_diario
        FROM compras
        WHERE DATE(Fecha_registro) = CURDATE();
    `, (error, results) => {
        if (error) {
            console.error('Error al obtener egresos diarios:', error);
            return res.status(500).json({ message: 'Error al obtener egresos diarios' });
        }
        res.json(results[0]);
    });
};

// Obtener ganancia diaria
exports.getGananciaDiaria = (req, res) => {
    db.query(`
        SELECT
            COALESCE(
                (SELECT SUM(CAST(Total AS DECIMAL(10,2))) FROM ventas WHERE DATE(Fecha_registro) = CURDATE()), 0
            ) AS total_ventas,
            COALESCE(
                (SELECT SUM(CAST(Total AS DECIMAL(10,2))) FROM compras WHERE DATE(Fecha_registro) = CURDATE()), 0
            ) AS total_compras;
    `, (error, results) => {
        if (error) {
            console.error('Error al obtener ganancia diaria:', error);
            return res.status(500).json({ message: 'Error al obtener ganancia diaria' });
        }

        const totalVentas = results[0].total_ventas;
        const totalCompras = results[0].total_compras;
        const gananciaDiaria = totalVentas - totalCompras;

        res.json({ ganancia_diaria: gananciaDiaria });
    });
};

// Obtener total de ventas por mes
exports.getTotalVentasPorMes = (req, res) => {
    db.query(`
        SELECT 
            DATE_FORMAT(Fecha_registro, '%Y-%m') AS mes,
            SUM(CAST(Total AS DECIMAL(10,2))) AS total_ventas
        FROM ventas
        GROUP BY mes
        ORDER BY mes DESC;
    `, (error, results) => {
        if (error) {
            console.error('Error al obtener total de ventas por mes:', error);
            return res.status(500).json({ message: 'Error al obtener total de ventas por mes' });
        }
        res.json(results);
    });
};

// Obtener total de ventas por mes
exports.getTotalComprasMesActual = (req, res) => {
    db.query(`
        SELECT 
            DATE_FORMAT(Fecha_registro, '%Y-%m') AS mes,
            SUM(CAST(Total AS DECIMAL(10,2))) AS total_ventas
        FROM compras
        GROUP BY mes
        ORDER BY mes DESC;
    `, (error, results) => {
        if (error) {
            console.error('Error al obtener total de ventas por mes:', error);
            return res.status(500).json({ message: 'Error al obtener total de ventas por mes' });
        }
        res.json(results);
    });
};


 
// Obtener los 10 productos más vendidos, asegurándose de no repetir productos
exports.getTop10ProductosMasVendidos = (req, res) => {
    db.query(`
        SELECT 
            p.Id_producto, 
            p.Nombre, 
            p.Precio_V, 
            p.Stock,
            SUM(dv.Cantidad) AS total_cantidad_vendida
        FROM detalles_ventas dv
        JOIN productos p ON dv.Id_producto = p.Id_producto
        GROUP BY p.Id_producto, p.Nombre, p.Precio_V, p.Stock
        ORDER BY total_cantidad_vendida DESC
        LIMIT 10;
    `, (error, results) => {
        if (error) {
            console.error('Error al obtener los productos más vendidos:', error);
            return res.status(500).json({ message: 'Error al obtener los productos más vendidos' });
        }
        res.json(results);
    });
};


