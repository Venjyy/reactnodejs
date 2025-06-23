const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Endpoint específico para crear pago desde dashboard
router.post('/pagos', (req, res) => {
    console.log('Endpoint POST /api/pagos llamado desde dashboard');
    console.log('Datos recibidos:', req.body);

    const { reservaId, monto, metodoPago, fechaPago, observaciones } = req.body;

    if (!reservaId || !monto || !fechaPago) {
        return res.status(400).json({
            error: 'Los campos reservaId, monto y fechaPago son obligatorios'
        });
    }

    // Verificar que la reserva existe
    const checkReservaQuery = 'SELECT id, estado FROM reserva WHERE id = ?';

    connection.query(checkReservaQuery, [reservaId], (err, results) => {
        if (err) {
            console.error('Error al verificar reserva:', err);
            return res.status(500).json({ error: 'Error al verificar reserva' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        if (results[0].estado === 'cancelada') {
            return res.status(400).json({ error: 'No se puede agregar pagos a una reserva cancelada' });
        }

        // Calcular el monto total (por ahora usaremos el mismo monto del abono)
        const montoTotal = monto;

        // Crear el pago
        const insertQuery = `
            INSERT INTO pago (reserva_id, monto_total, abono, metodo_pago, fecha_pago, observaciones)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        connection.query(insertQuery, [reservaId, montoTotal, monto, metodoPago || 'Efectivo', fechaPago, observaciones || ''], (err, result) => {
            if (err) {
                console.error('Error al crear pago:', err);
                return res.status(500).json({ error: 'Error al crear pago' });
            }

            console.log('Pago creado con ID:', result.insertId);
            res.status(201).json({
                id: result.insertId,
                message: 'Pago registrado correctamente',
                reservaId: reservaId,
                monto: parseFloat(monto)
            });
        });
    });
});

// Endpoint CORREGIDO para obtener todos los pagos
router.get('/pagos', (req, res) => {
    console.log('Endpoint /api/pagos llamado');

    const query = `
        SELECT 
            p.id,
            p.abono as monto,
            COALESCE(p.metodo_pago, 'Efectivo') as metodoPago,
            p.fecha_pago as fechaPago,
            COALESCE(p.observaciones, '') as observaciones,
            p.fecha_creacion,
            r.id as reservaId,
            r.fecha_reserva as fechaEvento,
            r.estado as reservaEstado,
            c.nombre as clienteNombre,
            c.rut as clienteRut,
            e.nombre as espacioNombre,
            e.costo_base as espacioCosto
        FROM pago p
        JOIN reserva r ON p.reserva_id = r.id
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        ORDER BY p.fecha_pago DESC, p.fecha_creacion DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener pagos:', err);
            return res.status(500).json({
                error: 'Error al obtener pagos',
                details: err.message
            });
        }

        // Procesar los resultados para agregar campos calculados
        const promises = results.map(pago => {
            return new Promise((resolve) => {
                // Obtener costo de servicios
                const queryServicios = `
                    SELECT COALESCE(SUM(s.costo), 0) as costoServicios
                    FROM reserva_servicio rs
                    JOIN servicio s ON rs.servicio_id = s.id
                    WHERE rs.reserva_id = ?
                `;

                connection.query(queryServicios, [pago.reservaId], (err, serviciosResult) => {
                    const costoServicios = err ? 0 : (serviciosResult[0]?.costoServicios || 0);

                    // Obtener total pagado para esta reserva
                    const queryTotalPagado = `
                        SELECT COALESCE(SUM(abono), 0) as totalPagado
                        FROM pago
                        WHERE reserva_id = ?
                    `;

                    connection.query(queryTotalPagado, [pago.reservaId], (err, totalResult) => {
                        const totalPagado = err ? 0 : (totalResult[0]?.totalPagado || 0);
                        const costoTotal = parseFloat(pago.espacioCosto) + parseFloat(costoServicios);
                        const saldoPendiente = costoTotal - parseFloat(totalPagado);

                        resolve({
                            id: pago.id,
                            reservaId: pago.reservaId,
                            clienteNombre: pago.clienteNombre,
                            clienteRut: pago.clienteRut,
                            espacioNombre: pago.espacioNombre,
                            fechaEvento: pago.fechaEvento,
                            monto: parseFloat(pago.monto),
                            metodoPago: pago.metodoPago || 'Efectivo',
                            fechaPago: pago.fechaPago,
                            tipoPago: 'abono',
                            estado: 'confirmado',
                            comprobante: '',
                            observaciones: pago.observaciones || '',
                            espacioCosto: parseFloat(pago.espacioCosto),
                            costoServicios: parseFloat(costoServicios),
                            costoTotal: costoTotal,
                            montoPagado: parseFloat(totalPagado),
                            saldoPendiente: saldoPendiente
                        });
                    });
                });
            });
        });

        Promise.all(promises).then(pagosCompletos => {
            console.log('Pagos obtenidos:', pagosCompletos.length);
            res.status(200).json(pagosCompletos);
        }).catch(error => {
            console.error('Error procesando pagos:', error);
            res.status(500).json({ error: 'Error procesando pagos' });
        });
    });
});

// Endpoint para obtener reservas disponibles para pagos
router.get('/reservas-para-pagos', (req, res) => {
    console.log('Endpoint /api/reservas-para-pagos llamado');

    const query = `
        SELECT 
            r.id,
            r.fecha_reserva as fechaEvento,
            r.estado,
            c.nombre as clienteNombre,
            c.rut as clienteRut,
            e.nombre as espacioNombre,
            e.costo_base
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        WHERE r.estado IN ('pendiente', 'confirmada')
        ORDER BY r.fecha_reserva ASC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener reservas para pagos:', err);
            return res.status(500).json({ error: 'Error al obtener reservas para pagos' });
        }

        // Para cada reserva, calcular el saldo pendiente
        const promises = results.map(reserva => {
            return new Promise((resolve) => {
                // Obtener costo de servicios
                const queryServicios = `
                    SELECT COALESCE(SUM(s.costo), 0) as costoServicios
                    FROM reserva_servicio rs
                    JOIN servicio s ON rs.servicio_id = s.id
                    WHERE rs.reserva_id = ?
                `;

                connection.query(queryServicios, [reserva.id], (err, serviciosResult) => {
                    const costoServicios = err ? 0 : (serviciosResult[0]?.costoServicios || 0);

                    // Obtener total pagado
                    const queryTotalPagado = `
                        SELECT COALESCE(SUM(abono), 0) as totalPagado
                        FROM pago
                        WHERE reserva_id = ?
                    `;

                    connection.query(queryTotalPagado, [reserva.id], (err, totalResult) => {
                        const totalPagado = err ? 0 : (totalResult[0]?.totalPagado || 0);
                        const costoTotal = parseFloat(reserva.costo_base) + parseFloat(costoServicios);
                        const saldoPendiente = costoTotal - parseFloat(totalPagado);

                        // Solo incluir si tiene saldo pendiente
                        if (saldoPendiente > 0) {
                            resolve({
                                id: reserva.id,
                                fechaEvento: reserva.fechaEvento,
                                estado: reserva.estado,
                                clienteNombre: reserva.clienteNombre,
                                clienteRut: reserva.clienteRut,
                                espacioNombre: reserva.espacioNombre,
                                costo_base: parseFloat(reserva.costo_base),
                                costoServicios: parseFloat(costoServicios),
                                costoTotal: costoTotal,
                                totalPagado: parseFloat(totalPagado),
                                saldoPendiente: saldoPendiente
                            });
                        } else {
                            resolve(null);
                        }
                    });
                });
            });
        });

        Promise.all(promises).then(reservasConSaldo => {
            const reservasFiltradas = reservasConSaldo.filter(r => r !== null);
            console.log('Reservas para pagos obtenidas:', reservasFiltradas.length);
            res.status(200).json(reservasFiltradas);
        }).catch(error => {
            console.error('Error procesando reservas:', error);
            res.status(500).json({ error: 'Error procesando reservas' });
        });
    });
});

// Endpoint para actualizar un pago
router.put('/pagos/:id', (req, res) => {
    console.log('Endpoint PUT /api/pagos llamado');

    const { id } = req.params;
    const { monto, metodoPago, fechaPago, observaciones } = req.body;

    if (!monto || !fechaPago) {
        return res.status(400).json({
            error: 'Los campos monto y fechaPago son obligatorios'
        });
    }

    const updateQuery = `
        UPDATE pago 
        SET monto_total = ?, abono = ?, metodo_pago = ?, fecha_pago = ?, observaciones = ?
        WHERE id = ?
    `;

    connection.query(updateQuery, [monto, monto, metodoPago || 'Efectivo', fechaPago, observaciones || '', id], (err, result) => {
        if (err) {
            console.error('Error al actualizar pago:', err);
            return res.status(500).json({ error: 'Error al actualizar pago' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        console.log('Pago actualizado:', id);
        res.status(200).json({ message: 'Pago actualizado correctamente' });
    });
});

// Endpoint para eliminar un pago
router.delete('/pagos/:id', (req, res) => {
    console.log('Endpoint DELETE /api/pagos llamado');

    const { id } = req.params;

    const deleteQuery = 'DELETE FROM pago WHERE id = ?';

    connection.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar pago:', err);
            return res.status(500).json({ error: 'Error al eliminar pago' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        console.log('Pago eliminado:', id);
        res.status(200).json({ message: 'Pago eliminado correctamente' });
    });
});

// Endpoint para obtener estadísticas de pagos
router.get('/pagos/estadisticas', (req, res) => {
    console.log('Endpoint /api/pagos/estadisticas llamado');

    const estadisticasQuery = `
        SELECT 
            COUNT(*) as total_transacciones,
            COALESCE(SUM(abono), 0) as total_ingresos,
            COALESCE((SELECT SUM(abono) FROM pago WHERE DATE(fecha_pago) = CURDATE()), 0) as pagos_hoy
        FROM pago
    `;

    connection.query(estadisticasQuery, (err, results) => {
        if (err) {
            console.error('Error al obtener estadísticas:', err);
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }

        // Calcular pagos pendientes por separado
        const pagosPendientesQuery = `
            SELECT 
                COALESCE(SUM(
                    (e.costo_base + COALESCE(servicios.costo_servicios, 0)) - COALESCE(pagos.total_pagado, 0)
                ), 0) as pagos_pendientes
            FROM reserva r
            JOIN espacio e ON r.espacio_id = e.id
            LEFT JOIN (
                SELECT rs.reserva_id, SUM(s.costo) as costo_servicios
                FROM reserva_servicio rs
                JOIN servicio s ON rs.servicio_id = s.id
                GROUP BY rs.reserva_id
            ) servicios ON r.id = servicios.reserva_id
            LEFT JOIN (
                SELECT reserva_id, SUM(abono) as total_pagado
                FROM pago
                GROUP BY reserva_id
            ) pagos ON r.id = pagos.reserva_id
            WHERE r.estado IN ('confirmada', 'pendiente')
            AND ((e.costo_base + COALESCE(servicios.costo_servicios, 0)) - COALESCE(pagos.total_pagado, 0)) > 0
        `;

        connection.query(pagosPendientesQuery, (err, pendientesResult) => {
            const data = results[0] || {};
            const pendientesData = pendientesResult[0] || {};

            const estadisticas = {
                totalIngresos: parseFloat(data.total_ingresos) || 0,
                totalTransacciones: parseInt(data.total_transacciones) || 0,
                pagosHoy: parseFloat(data.pagos_hoy) || 0,
                pagosPendientes: parseFloat(pendientesData.pagos_pendientes) || 0
            };

            console.log('Estadísticas de pagos obtenidas:', estadisticas);
            res.status(200).json(estadisticas);
        });
    });
});

module.exports = router;