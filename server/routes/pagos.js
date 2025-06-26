const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Endpoint específico para crear pago desde dashboard
router.post('/pagos', (req, res) => {
    console.log('Endpoint POST /api/pagos llamado desde dashboard');
    console.log('Datos recibidos:', req.body);

    const { reservaId, monto, metodoPago, fechaPago, tipoPago, comprobante, observaciones } = req.body;

    if (!reservaId || !monto || !fechaPago) {
        return res.status(400).json({
            error: 'Los campos reservaId, monto y fechaPago son obligatorios'
        });
    }

    if (monto <= 0) {
        return res.status(400).json({
            error: 'El monto debe ser mayor a 0'
        });
    }

    // Verificar que la reserva existe y no está cancelada
    const checkReservaQuery = `
        SELECT r.id, r.estado, r.fecha_reserva, c.nombre as clienteNombre, e.nombre as espacioNombre
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        WHERE r.id = ?
    `;

    connection.query(checkReservaQuery, [reservaId], (err, results) => {
        if (err) {
            console.error('Error al verificar reserva:', err);
            return res.status(500).json({
                error: 'Error al verificar reserva',
                details: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const reserva = results[0];

        if (reserva.estado === 'cancelada') {
            return res.status(400).json({ error: 'No se puede agregar pagos a una reserva cancelada' });
        }

        // Verificar saldo disponible
        const checkSaldoQuery = `
            SELECT 
                (e.costo_base + COALESCE(servicios.costo_servicios, 0)) as costoTotal,
                COALESCE(pagos.total_pagado, 0) as totalPagado,
                ((e.costo_base + COALESCE(servicios.costo_servicios, 0)) - COALESCE(pagos.total_pagado, 0)) as saldoPendiente
            FROM reserva r
            JOIN espacio e ON r.espacio_id = e.id
            LEFT JOIN (
                SELECT rs.reserva_id, SUM(s.costo) as costo_servicios
                FROM reserva_servicio rs
                JOIN servicio s ON rs.servicio_id = s.id
                WHERE rs.reserva_id = ?
                GROUP BY rs.reserva_id
            ) servicios ON r.id = servicios.reserva_id
            LEFT JOIN (
                SELECT reserva_id, SUM(abono) as total_pagado
                FROM pago
                WHERE reserva_id = ?
                GROUP BY reserva_id
            ) pagos ON r.id = pagos.reserva_id
            WHERE r.id = ?
        `;

        connection.query(checkSaldoQuery, [reservaId, reservaId, reservaId], (err, saldoResults) => {
            if (err) {
                console.error('Error al verificar saldo:', err);
                return res.status(500).json({
                    error: 'Error al verificar saldo',
                    details: err.message
                });
            }

            const saldoInfo = saldoResults[0];
            const saldoPendiente = saldoInfo.saldoPendiente;

            if (monto > saldoPendiente) {
                return res.status(400).json({
                    error: `El monto ($${monto.toLocaleString()}) excede el saldo pendiente ($${saldoPendiente.toLocaleString()})`
                });
            }

            // Crear el pago
            const insertQuery = `
                INSERT INTO pago (reserva_id, monto_total, abono, metodo_pago, tipo_pago, fecha_pago, observaciones)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            connection.query(insertQuery, [
                reservaId,
                monto,
                monto,
                metodoPago || 'Efectivo',
                tipoPago || 'abono',
                fechaPago,
                observaciones || ''
            ], (err, result) => {
                if (err) {
                    console.error('Error al crear pago:', err);
                    return res.status(500).json({
                        error: 'Error al crear pago',
                        details: err.message
                    });
                }

                console.log('Pago creado con ID:', result.insertId);

                // Respuesta con más información
                res.status(201).json({
                    id: result.insertId,
                    message: 'Pago registrado correctamente',
                    reservaId: reservaId,
                    clienteNombre: reserva.clienteNombre,
                    espacioNombre: reserva.espacioNombre,
                    monto: parseFloat(monto),
                    metodoPago: metodoPago || 'Efectivo',
                    saldoAnterior: saldoPendiente,
                    nuevoSaldo: saldoPendiente - parseFloat(monto)
                });
            });
        });
    });
});

// Endpoint MEJORADO para obtener todos los pagos - FECHA CORREGIDA
router.get('/pagos', (req, res) => {
    console.log('Endpoint /api/pagos llamado');

    const query = `
        SELECT 
            p.id,
            p.abono as monto,
            COALESCE(p.metodo_pago, 'Efectivo') as metodoPago,
            COALESCE(p.tipo_pago, 'abono') as tipoPago,
            DATE(p.fecha_pago) as fechaPago,
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

                        // Formatear fecha como YYYY-MM-DD
                        let fechaFormateada = '';
                        if (pago.fechaPago) {
                            if (pago.fechaPago instanceof Date) {
                                fechaFormateada = pago.fechaPago.toISOString().split('T')[0];
                            } else {
                                // Si viene como string, asegurar formato YYYY-MM-DD
                                const fecha = new Date(pago.fechaPago);
                                if (!isNaN(fecha.getTime())) {
                                    fechaFormateada = fecha.toISOString().split('T')[0];
                                } else {
                                    fechaFormateada = pago.fechaPago;
                                }
                            }
                        }

                        resolve({
                            id: pago.id,
                            reservaId: pago.reservaId,
                            clienteNombre: pago.clienteNombre || 'Cliente no disponible',
                            clienteRut: pago.clienteRut || '',
                            espacioNombre: pago.espacioNombre || 'Espacio no disponible',
                            fechaEvento: pago.fechaEvento,
                            monto: parseFloat(pago.monto) || 0,
                            metodoPago: pago.metodoPago || 'Efectivo',
                            fechaPago: fechaFormateada,
                            tipoPago: pago.tipoPago || 'abono',
                            estado: 'confirmado',
                            comprobante: '',
                            observaciones: pago.observaciones || '',
                            espacioCosto: parseFloat(pago.espacioCosto) || 0,
                            costoServicios: parseFloat(costoServicios) || 0,
                            costoTotal: costoTotal || 0,
                            montoPagado: parseFloat(totalPagado) || 0,
                            saldoPendiente: Math.max(0, saldoPendiente) || 0
                        });
                    });
                });
            });
        });

        Promise.all(promises).then(pagosCompletos => {
            console.log('Pagos obtenidos y procesados:', pagosCompletos.length);
            res.status(200).json(pagosCompletos);
        }).catch(error => {
            console.error('Error procesando pagos:', error);
            res.status(500).json({
                error: 'Error procesando pagos',
                details: error.message
            });
        });
    });
});

// Endpoint MEJORADO para obtener reservas disponibles para pagos
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
            return res.status(500).json({
                error: 'Error al obtener reservas para pagos',
                details: err.message
            });
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
                                clienteNombre: reserva.clienteNombre || 'Cliente no disponible',
                                clienteRut: reserva.clienteRut || '',
                                espacioNombre: reserva.espacioNombre || 'Espacio no disponible',
                                costo_base: parseFloat(reserva.costo_base) || 0,
                                costoServicios: parseFloat(costoServicios) || 0,
                                costoTotal: costoTotal || 0,
                                totalPagado: parseFloat(totalPagado) || 0,
                                saldoPendiente: Math.max(0, saldoPendiente) || 0
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
            res.status(500).json({
                error: 'Error procesando reservas',
                details: error.message
            });
        });
    });
});

// Endpoint MEJORADO para actualizar un pago
router.put('/pagos/:id', (req, res) => {
    console.log('Endpoint PUT /api/pagos/:id llamado');
    console.log('ID de pago:', req.params.id);
    console.log('Datos recibidos:', req.body);

    const { id } = req.params;
    const { monto, metodoPago, fechaPago, tipoPago, comprobante, observaciones } = req.body;

    if (!monto || !fechaPago) {
        return res.status(400).json({
            error: 'Los campos monto y fechaPago son obligatorios'
        });
    }

    if (monto <= 0) {
        return res.status(400).json({
            error: 'El monto debe ser mayor a 0'
        });
    }

    // Verificar que el pago existe y obtener información de la reserva
    const checkPagoQuery = `
        SELECT p.*, r.estado as reservaEstado, c.nombre as clienteNombre, e.nombre as espacioNombre
        FROM pago p
        JOIN reserva r ON p.reserva_id = r.id
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        WHERE p.id = ?
    `;

    connection.query(checkPagoQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar pago:', err);
            return res.status(500).json({
                error: 'Error al verificar pago',
                details: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        const pagoActual = results[0];

        if (pagoActual.reservaEstado === 'cancelada') {
            return res.status(400).json({ error: 'No se puede modificar pagos de una reserva cancelada' });
        }

        // Verificar saldo disponible (sin contar el pago actual)
        const checkSaldoQuery = `
            SELECT 
                (e.costo_base + COALESCE(servicios.costo_servicios, 0)) as costoTotal,
                (COALESCE(pagos.total_pagado, 0) - ?) as totalPagadoSinActual,
                ((e.costo_base + COALESCE(servicios.costo_servicios, 0)) - (COALESCE(pagos.total_pagado, 0) - ?)) as saldoDisponible
            FROM reserva r
            JOIN espacio e ON r.espacio_id = e.id
            LEFT JOIN (
                SELECT rs.reserva_id, SUM(s.costo) as costo_servicios
                FROM reserva_servicio rs
                JOIN servicio s ON rs.servicio_id = s.id
                WHERE rs.reserva_id = ?
                GROUP BY rs.reserva_id
            ) servicios ON r.id = servicios.reserva_id
            LEFT JOIN (
                SELECT reserva_id, SUM(abono) as total_pagado
                FROM pago
                WHERE reserva_id = ?
                GROUP BY reserva_id
            ) pagos ON r.id = pagos.reserva_id
            WHERE r.id = ?
        `;

        connection.query(checkSaldoQuery, [
            pagoActual.abono,
            pagoActual.abono,
            pagoActual.reserva_id,
            pagoActual.reserva_id,
            pagoActual.reserva_id
        ], (err, saldoResults) => {
            if (err) {
                console.error('Error al verificar saldo:', err);
                return res.status(500).json({
                    error: 'Error al verificar saldo',
                    details: err.message
                });
            }

            const saldoInfo = saldoResults[0];
            const saldoDisponible = saldoInfo.saldoDisponible;

            if (monto > saldoDisponible) {
                return res.status(400).json({
                    error: `El monto ($${monto.toLocaleString()}) excede el saldo disponible ($${saldoDisponible.toLocaleString()})`
                });
            }

            // Actualizar el pago
            const updateQuery = `
                UPDATE pago 
                SET monto_total = ?, abono = ?, metodo_pago = ?, tipo_pago = ?, fecha_pago = ?, observaciones = ?
                WHERE id = ?
            `;

            connection.query(updateQuery, [
                monto,
                monto,
                metodoPago || 'Efectivo',
                tipoPago || 'abono',
                fechaPago,
                observaciones || '',
                id
            ], (err, result) => {
                if (err) {
                    console.error('Error al actualizar pago:', err);
                    return res.status(500).json({
                        error: 'Error al actualizar pago',
                        details: err.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Pago no encontrado' });
                }

                console.log('Pago actualizado:', id);
                res.status(200).json({
                    id: id,
                    message: 'Pago actualizado correctamente',
                    clienteNombre: pagoActual.clienteNombre,
                    espacioNombre: pagoActual.espacioNombre,
                    montoAnterior: parseFloat(pagoActual.abono),
                    montoNuevo: parseFloat(monto)
                });
            });
        });
    });
});

// Endpoint MEJORADO para eliminar un pago
router.delete('/pagos/:id', (req, res) => {
    console.log('Endpoint DELETE /api/pagos/:id llamado');
    console.log('ID de pago:', req.params.id);

    const { id } = req.params;

    // Primero obtener información del pago antes de eliminarlo
    const getPagoQuery = `
        SELECT p.*, c.nombre as clienteNombre, e.nombre as espacioNombre
        FROM pago p
        JOIN reserva r ON p.reserva_id = r.id
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        WHERE p.id = ?
    `;

    connection.query(getPagoQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener información del pago:', err);
            return res.status(500).json({
                error: 'Error al obtener información del pago',
                details: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        const pagoInfo = results[0];

        // Eliminar el pago
        const deleteQuery = 'DELETE FROM pago WHERE id = ?';

        connection.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar pago:', err);
                return res.status(500).json({
                    error: 'Error al eliminar pago',
                    details: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Pago no encontrado' });
            }

            console.log('Pago eliminado:', id);
            res.status(200).json({
                message: 'Pago eliminado correctamente',
                pagoEliminado: {
                    id: id,
                    clienteNombre: pagoInfo.clienteNombre,
                    espacioNombre: pagoInfo.espacioNombre,
                    monto: parseFloat(pagoInfo.abono),
                    fechaPago: pagoInfo.fecha_pago
                }
            });
        });
    });
});

// Endpoint MEJORADO para obtener estadísticas de pagos
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
            return res.status(500).json({
                error: 'Error al obtener estadísticas',
                details: err.message
            });
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
            if (err) {
                console.error('Error al calcular pagos pendientes:', err);
                return res.status(500).json({
                    error: 'Error al calcular pagos pendientes',
                    details: err.message
                });
            }

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