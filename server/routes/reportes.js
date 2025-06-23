const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Endpoint para obtener estadísticas generales
router.get('/reportes/estadisticas-generales', (req, res) => {
    console.log('Endpoint /api/reportes/estadisticas-generales llamado');

    const query = `
        SELECT 
            (SELECT COUNT(*) FROM cliente) as totalClientes,
            (SELECT COUNT(*) FROM reserva) as totalReservas,
            (SELECT COUNT(*) FROM espacio) as totalEspacios,
            (SELECT COUNT(*) FROM servicio) as totalServicios,
            (SELECT COALESCE(SUM(abono), 0) FROM pago) as totalIngresos,
            (SELECT COUNT(*) FROM reserva WHERE estado = 'pendiente') as reservasPendientes,
            (SELECT COUNT(*) FROM reserva WHERE estado = 'confirmada') as reservasConfirmadas,
            (SELECT COUNT(*) FROM reserva WHERE estado = 'cancelada') as reservasCanceladas,
            85.5 as tasaOcupacion,
            12.3 as crecimientoMensual
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener estadísticas generales:', err);
            return res.status(500).json({ error: 'Error al obtener estadísticas generales' });
        }

        const estadisticas = results[0] || {};
        console.log('Estadísticas generales obtenidas');
        res.status(200).json(estadisticas);
    });
});

// Endpoint CORREGIDO para obtener ventas por mes
router.get('/reportes/ventas-por-mes', (req, res) => {
    console.log('Endpoint /api/reportes/ventas-por-mes llamado');

    const query = `
        SELECT 
            YEAR(fecha_pago) as año,
            MONTH(fecha_pago) as mesNumero,
            MONTHNAME(fecha_pago) as mes,
            COUNT(*) as reservas,
            SUM(abono) as ingresos
        FROM pago
        WHERE fecha_pago >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY YEAR(fecha_pago), MONTH(fecha_pago), MONTHNAME(fecha_pago)
        ORDER BY YEAR(fecha_pago) DESC, MONTH(fecha_pago) DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener ventas por mes:', err);
            return res.status(500).json({ error: 'Error al obtener ventas por mes' });
        }

        // Asegurar que cada registro tenga los campos requeridos
        const ventasPorMes = results.map(row => ({
            año: row.año || new Date().getFullYear(),
            mesNumero: row.mesNumero || 1,
            mes: row.mes || 'Enero',
            reservas: parseInt(row.reservas) || 0,
            ingresos: parseFloat(row.ingresos) || 0
        }));

        console.log('Ventas por mes obtenidas:', ventasPorMes.length);
        res.status(200).json(ventasPorMes);
    });
});

// Endpoint CORREGIDO para obtener espacios más reservados
router.get('/reportes/espacios-mas-reservados', (req, res) => {
    console.log('Endpoint /api/reportes/espacios-mas-reservados llamado');

    const query = `
        SELECT 
            e.id,
            e.nombre,
            e.capacidad,
            COUNT(r.id) as reservas,
            SUM(CASE WHEN r.estado = 'confirmada' THEN 1 ELSE 0 END) as reservasConfirmadas,
            COALESCE(SUM(p.abono), 0) as ingresos,
            CASE 
                WHEN (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE())) > 0
                THEN ROUND((COUNT(r.id) * 100.0 / (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE()))), 1)
                ELSE 0
            END as ocupacion
        FROM espacio e
        LEFT JOIN reserva r ON e.id = r.espacio_id
        LEFT JOIN pago p ON r.id = p.reserva_id
        GROUP BY e.id, e.nombre, e.capacidad
        ORDER BY reservas DESC, ingresos DESC
        LIMIT 10
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener espacios más reservados:', err);
            return res.status(500).json({ error: 'Error al obtener espacios más reservados' });
        }

        // Asegurar que cada registro tenga los campos requeridos
        const espaciosMasReservados = results.map(row => ({
            id: row.id,
            nombre: row.nombre || 'Sin nombre',
            capacidad: parseInt(row.capacidad) || 0,
            reservas: parseInt(row.reservas) || 0,
            reservasConfirmadas: parseInt(row.reservasConfirmadas) || 0,
            ingresos: parseFloat(row.ingresos) || 0,
            ocupacion: parseFloat(row.ocupacion) || 0
        }));

        console.log('Espacios más reservados obtenidos:', espaciosMasReservados.length);
        res.status(200).json(espaciosMasReservados);
    });
});

// Endpoint CORREGIDO para obtener servicios más contratados
router.get('/reportes/servicios-mas-contratados', (req, res) => {
    console.log('Endpoint /api/reportes/servicios-mas-contratados llamado');

    const query = `
        SELECT 
            s.id,
            s.nombre,
            s.costo,
            COUNT(rs.reserva_id) as contrataciones,
            (COUNT(rs.reserva_id) * s.costo) as ingresos
        FROM servicio s
        LEFT JOIN reserva_servicio rs ON s.id = rs.servicio_id
        GROUP BY s.id, s.nombre, s.costo
        ORDER BY contrataciones DESC, ingresos DESC
        LIMIT 10
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener servicios más contratados:', err);
            return res.status(500).json({ error: 'Error al obtener servicios más contratados' });
        }

        // Asegurar que cada registro tenga los campos requeridos
        const serviciosMasContratados = results.map(row => ({
            id: row.id,
            nombre: row.nombre || 'Sin nombre',
            costo: parseFloat(row.costo) || 0,
            contrataciones: parseInt(row.contrataciones) || 0,
            ingresos: parseFloat(row.ingresos) || 0
        }));

        console.log('Servicios más contratados obtenidos:', serviciosMasContratados.length);
        res.status(200).json(serviciosMasContratados);
    });
});

// Endpoint CORREGIDO para obtener clientes top por ingresos
router.get('/reportes/clientes-top-ingresos', (req, res) => {
    console.log('Endpoint /api/reportes/clientes-top-ingresos llamado');

    const query = `
        SELECT 
            c.id,
            c.nombre,
            c.rut,
            c.correo,
            COUNT(r.id) as reservas,
            COALESCE(SUM(p.abono), 0) as ingresos,
            MAX(r.fecha_reserva) as ultimaReserva
        FROM cliente c
        LEFT JOIN reserva r ON c.id = r.cliente_id
        LEFT JOIN pago p ON r.id = p.reserva_id
        GROUP BY c.id, c.nombre, c.rut, c.correo
        HAVING ingresos > 0
        ORDER BY ingresos DESC, reservas DESC
        LIMIT 10
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener clientes top:', err);
            return res.status(500).json({ error: 'Error al obtener clientes top' });
        }

        // Asegurar que cada registro tenga los campos requeridos
        const clientesTopPorIngresos = results.map(row => ({
            id: row.id,
            nombre: row.nombre || 'Sin nombre',
            rut: row.rut || '',
            correo: row.correo || '',
            reservas: parseInt(row.reservas) || 0,
            ingresos: parseFloat(row.ingresos) || 0,
            ultimaReserva: row.ultimaReserva || null
        }));

        console.log('Clientes top por ingresos obtenidos:', clientesTopPorIngresos.length);
        res.status(200).json(clientesTopPorIngresos);
    });
});

// Endpoint CORREGIDO consolidado para obtener todos los datos de reportes
router.get('/reportes/datos-completos', (req, res) => {
    console.log('Endpoint /api/reportes/datos-completos llamado');

    // Ejecutar todas las consultas en paralelo
    const queries = {
        estadisticasGenerales: `
            SELECT 
                (SELECT COUNT(*) FROM cliente) as totalClientes,
                (SELECT COUNT(*) FROM reserva) as totalReservas,
                (SELECT COUNT(*) FROM espacio) as totalEspacios,
                (SELECT COUNT(*) FROM servicio) as totalServicios,
                (SELECT COALESCE(SUM(abono), 0) FROM pago) as totalIngresos,
                (SELECT COUNT(*) FROM reserva WHERE estado = 'pendiente') as reservasPendientes,
                (SELECT COUNT(*) FROM reserva WHERE estado = 'confirmada') as reservasConfirmadas,
                (SELECT COUNT(*) FROM reserva WHERE estado = 'cancelada') as reservasCanceladas,
                85.5 as tasaOcupacion,
                12.3 as crecimientoMensual
        `,
        ventasPorMes: `
            SELECT 
                YEAR(fecha_pago) as año,
                MONTH(fecha_pago) as mesNumero,
                MONTHNAME(fecha_pago) as mes,
                COUNT(*) as reservas,
                SUM(abono) as ingresos
            FROM pago
            WHERE fecha_pago >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY YEAR(fecha_pago), MONTH(fecha_pago), MONTHNAME(fecha_pago)
            ORDER BY YEAR(fecha_pago) DESC, MONTH(fecha_pago) DESC
        `,
        espaciosMasReservados: `
            SELECT 
                e.id,
                e.nombre,
                e.capacidad,
                COUNT(r.id) as reservas,
                SUM(CASE WHEN r.estado = 'confirmada' THEN 1 ELSE 0 END) as reservasConfirmadas,
                COALESCE(SUM(p.abono), 0) as ingresos,
                CASE 
                    WHEN (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE())) > 0
                    THEN ROUND((COUNT(r.id) * 100.0 / (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE()))), 1)
                    ELSE 0
                END as ocupacion
            FROM espacio e
            LEFT JOIN reserva r ON e.id = r.espacio_id
            LEFT JOIN pago p ON r.id = p.reserva_id
            GROUP BY e.id, e.nombre, e.capacidad
            ORDER BY reservas DESC, ingresos DESC
            LIMIT 10
        `,
        serviciosMasContratados: `
            SELECT 
                s.id,
                s.nombre,
                s.costo,
                COUNT(rs.reserva_id) as contrataciones,
                (COUNT(rs.reserva_id) * s.costo) as ingresos
            FROM servicio s
            LEFT JOIN reserva_servicio rs ON s.id = rs.servicio_id
            GROUP BY s.id, s.nombre, s.costo
            ORDER BY contrataciones DESC, ingresos DESC
            LIMIT 10
        `,
        clientesTopIngresos: `
            SELECT 
                c.id,
                c.nombre,
                c.rut,
                c.correo,
                COUNT(r.id) as reservas,
                COALESCE(SUM(p.abono), 0) as ingresos,
                MAX(r.fecha_reserva) as ultimaReserva
            FROM cliente c
            LEFT JOIN reserva r ON c.id = r.cliente_id
            LEFT JOIN pago p ON r.id = p.reserva_id
            GROUP BY c.id, c.nombre, c.rut, c.correo
            HAVING ingresos > 0
            ORDER BY ingresos DESC, reservas DESC
            LIMIT 10
        `
    };

    const resultados = {};
    let consultasCompletadas = 0;
    const totalConsultas = Object.keys(queries).length;

    const ejecutarConsulta = (nombre, query) => {
        connection.query(query, (err, results) => {
            if (err) {
                console.error(`Error en consulta ${nombre}:`, err);
                resultados[nombre] = [];
            } else {
                // Formatear datos según lo que espera el frontend
                switch (nombre) {
                    case 'estadisticasGenerales':
                        resultados[nombre] = results[0] || {};
                        break;
                    case 'ventasPorMes':
                        resultados[nombre] = results.map(row => ({
                            año: row.año || new Date().getFullYear(),
                            mesNumero: row.mesNumero || 1,
                            mes: row.mes || 'Enero',
                            reservas: parseInt(row.reservas) || 0,
                            ingresos: parseFloat(row.ingresos) || 0
                        }));
                        break;
                    case 'espaciosMasReservados':
                        resultados[nombre] = results.map(row => ({
                            id: row.id,
                            nombre: row.nombre || 'Sin nombre',
                            capacidad: parseInt(row.capacidad) || 0,
                            reservas: parseInt(row.reservas) || 0,
                            reservasConfirmadas: parseInt(row.reservasConfirmadas) || 0,
                            ingresos: parseFloat(row.ingresos) || 0,
                            ocupacion: parseFloat(row.ocupacion) || 0
                        }));
                        break;
                    case 'serviciosMasContratados':
                        resultados[nombre] = results.map(row => ({
                            id: row.id,
                            nombre: row.nombre || 'Sin nombre',
                            costo: parseFloat(row.costo) || 0,
                            contrataciones: parseInt(row.contrataciones) || 0,
                            ingresos: parseFloat(row.ingresos) || 0
                        }));
                        break;
                    case 'clientesTopIngresos':
                        resultados[nombre] = results.map(row => ({
                            id: row.id,
                            nombre: row.nombre || 'Sin nombre',
                            rut: row.rut || '',
                            correo: row.correo || '',
                            reservas: parseInt(row.reservas) || 0,
                            ingresos: parseFloat(row.ingresos) || 0,
                            ultimaReserva: row.ultimaReserva || null
                        }));
                        break;
                    default:
                        resultados[nombre] = results;
                }
            }

            consultasCompletadas++;

            if (consultasCompletadas === totalConsultas) {
                console.log('Datos completos de reportes obtenidos');
                res.status(200).json(resultados);
            }
        });
    };

    // Ejecutar todas las consultas
    Object.entries(queries).forEach(([nombre, query]) => {
        ejecutarConsulta(nombre, query);
    });
});

module.exports = router;