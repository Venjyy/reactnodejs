const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Endpoint para obtener estadísticas del dashboard
router.get('/stats', (req, res) => {
    console.log('Endpoint /dashboard/stats llamado');

    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM cliente) as totalClientes,
            (SELECT COUNT(*) FROM reserva) as totalReservas,
            (SELECT COUNT(*) FROM reserva WHERE DATE(fecha_reserva) = CURDATE()) as reservasHoy,
            (SELECT COALESCE(SUM(p.abono), 0) FROM pago p 
             WHERE MONTH(p.fecha_pago) = MONTH(CURDATE()) 
             AND YEAR(p.fecha_pago) = YEAR(CURDATE())) as ingresosMes
    `;

    connection.query(statsQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta de estadísticas:', err);
            res.status(500).json({
                error: 'Error al obtener estadísticas',
                details: err.message
            });
            return;
        }

        const stats = results[0] || {
            totalClientes: 0,
            totalReservas: 0,
            reservasHoy: 0,
            ingresosMes: 0
        };

        console.log('Estadísticas obtenidas:', stats);
        res.json(stats);
    });
});

// Endpoint para obtener reservas recientes
router.get('/reservas-recientes', (req, res) => {
    console.log('Endpoint /dashboard/reservas-recientes llamado');

    const reservasQuery = `
        SELECT 
            r.id,
            r.fecha_reserva,
            r.estado,
            r.razon,
            c.nombre as cliente_nombre,
            e.nombre as espacio_nombre
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        WHERE r.fecha_reserva >= NOW()
        ORDER BY r.fecha_reserva ASC
        LIMIT 5
    `;

    connection.query(reservasQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta de reservas recientes:', err);
            res.status(500).json({
                error: 'Error al obtener reservas recientes',
                details: err.message
            });
            return;
        }

        console.log('Reservas recientes obtenidas:', results.length);
        res.json(results);
    });
});

// Endpoint para obtener resumen financiero
router.get('/resumen-financiero', (req, res) => {
    console.log('Endpoint /dashboard/resumen-financiero llamado');

    const financieroQuery = `
        SELECT 
            (SELECT COALESCE(SUM(p.abono), 0) FROM pago p 
             WHERE MONTH(p.fecha_pago) = MONTH(CURDATE()) 
             AND YEAR(p.fecha_pago) = YEAR(CURDATE())) as ingresosMes,
            (SELECT COALESCE(SUM(
                (e.costo_base + COALESCE(servicios_total.costo_servicios, 0)) - COALESCE(pagos_total.total_pagado, 0)
            ), 0) FROM reserva r
             JOIN espacio e ON r.espacio_id = e.id
             LEFT JOIN (
                 SELECT rs.reserva_id, SUM(s.costo) as costo_servicios
                 FROM reserva_servicio rs
                 JOIN servicio s ON rs.servicio_id = s.id
                 GROUP BY rs.reserva_id
             ) servicios_total ON r.id = servicios_total.reserva_id
             LEFT JOIN (
                 SELECT reserva_id, SUM(abono) as total_pagado
                 FROM pago
                 GROUP BY reserva_id
             ) pagos_total ON r.id = pagos_total.reserva_id
             WHERE r.estado IN ('confirmada', 'pendiente')
             AND ((e.costo_base + COALESCE(servicios_total.costo_servicios, 0)) - COALESCE(pagos_total.total_pagado, 0)) > 0) as pagosPendientes,
            (SELECT COALESCE(
                (SUM(p.abono) / NULLIF(COUNT(DISTINCT MONTH(p.fecha_pago)), 0)) * 12, 0
            ) FROM pago p 
             WHERE YEAR(p.fecha_pago) = YEAR(CURDATE())) as proyeccionMensual
    `;

    connection.query(financieroQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta financiera:', err);
            res.status(500).json({
                error: 'Error al obtener datos financieros',
                details: err.message
            });
            return;
        }

        const data = results[0] || {
            ingresosMes: 0,
            pagosPendientes: 0,
            proyeccionMensual: 0
        };

        console.log('Datos financieros obtenidos:', data);
        res.json(data);
    });
});

// Endpoint para obtener espacios más utilizados
router.get('/espacios-ranking', (req, res) => {
    console.log('Endpoint /dashboard/espacios-ranking llamado');

    const rankingQuery = `
        SELECT 
            e.nombre,
            COUNT(r.id) as total_reservas,
            CASE 
                WHEN (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE())) > 0
                THEN ROUND((COUNT(r.id) * 100.0 / (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE()))), 1)
                ELSE 0
            END as porcentaje
        FROM espacio e
        LEFT JOIN reserva r ON e.id = r.espacio_id 
            AND MONTH(r.fecha_reserva) = MONTH(CURDATE()) 
            AND YEAR(r.fecha_reserva) = YEAR(CURDATE())
        GROUP BY e.id, e.nombre
        ORDER BY total_reservas DESC, e.nombre ASC
        LIMIT 5
    `;

    connection.query(rankingQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta de ranking:', err);
            res.status(500).json({
                error: 'Error al obtener ranking de espacios',
                details: err.message
            });
            return;
        }

        console.log('Ranking de espacios obtenido:', results);
        res.json(results);
    });
});

module.exports = router;