const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// 🔔 Webhook para recibir notificaciones de Khipu
router.post('/webhook', async (req, res) => {
    console.log('🔔 Webhook Khipu recibido:', req.body);
    console.log('📋 Headers:', req.headers);

    const {
        payment_id,
        status,
        transaction_id,
        amount,
        currency,
        payer_email,
        notification_id,
        notification_token
    } = req.body;

    try {
        // Validar datos básicos
        if (!payment_id || !status || !transaction_id) {
            console.error('❌ Webhook inválido - faltan datos requeridos');
            return res.status(400).json({
                error: 'Datos insuficientes en webhook'
            });
        }

        console.log(`📨 Procesando webhook para pago ${payment_id} con estado: ${status}`);

        // Extraer ID de reserva del transaction_id
        const reservaId = transaction_id.replace('RESERVA-', '').replace('TEST-', '');

        if (status === 'done') {
            // ✅ Pago completado exitosamente
            console.log(`✅ Pago completado exitosamente:`);
            console.log(`   💰 Monto: $${amount} ${currency}`);
            console.log(`   📧 Email: ${payer_email}`);
            console.log(`   🎫 Reserva: ${reservaId}`);

            // Si es pago de prueba, solo logear y responder
            if (transaction_id.startsWith('TEST-')) {
                console.log('🧪 Pago de prueba completado - no se actualiza BD');
                return res.status(200).json({
                    received: true,
                    message: 'Pago de prueba completado'
                });
            }

            // Actualizar estado de pago en base de datos
            const updatePagoQuery = `
                UPDATE pago 
                SET 
                    observaciones = CONCAT(IFNULL(observaciones, ''), ' - Pago confirmado por Khipu ID: ${payment_id}'),
                    metodo_pago = 'Khipu - Transferencia',
                    fecha_pago = NOW()
                WHERE reserva_id = ? 
                AND observaciones LIKE '%${payment_id}%'
                ORDER BY fecha_creacion DESC 
                LIMIT 1
            `;

            connection.query(updatePagoQuery, [reservaId], (err, result) => {
                if (err) {
                    console.error('❌ Error al actualizar pago en BD:', err);
                } else if (result.affectedRows > 0) {
                    console.log('✅ Pago actualizado en BD');
                } else {
                    console.log('⚠️ No se encontró pago para actualizar');
                }
            });

            // Confirmar reserva si estaba pendiente
            const updateReservaQuery = `
                UPDATE reserva 
                SET estado = 'confirmada' 
                WHERE id = ? AND estado = 'pendiente'
            `;

            connection.query(updateReservaQuery, [reservaId], (err, result) => {
                if (err) {
                    console.error('❌ Error al confirmar reserva:', err);
                } else if (result.affectedRows > 0) {
                    console.log('✅ Reserva confirmada automáticamente');
                } else {
                    console.log('ℹ️ Reserva ya estaba confirmada');
                }
            });

            // Obtener datos del cliente para notificaciones futuras
            const getClienteQuery = `
                SELECT c.nombre, c.correo, c.telefono, r.razon, r.fecha_reserva, e.nombre as espacio
                FROM reserva r
                JOIN cliente c ON r.cliente_id = c.id  
                JOIN espacio e ON r.espacio_id = e.id
                WHERE r.id = ?
            `;

            connection.query(getClienteQuery, [reservaId], (err, results) => {
                if (err) {
                    console.error('❌ Error al obtener datos del cliente:', err);
                } else if (results.length > 0) {
                    const cliente = results[0];
                    console.log(`📧 Cliente notificado: ${cliente.nombre} (${cliente.correo})`);

                    // TODO: Aquí podrías integrar notificaciones por WhatsApp o Email
                    // enviarConfirmacionEvento(cliente);
                    // enviarWhatsAppConfirmacion(cliente);
                }
            });

        } else if (status === 'failed' || status === 'rejected') {
            // ❌ Pago falló o fue rechazado
            console.log(`❌ Pago ${status}: ${payment_id}`);

            if (!transaction_id.startsWith('TEST-')) {
                // Marcar pago como fallido en BD
                const updatePagoFailedQuery = `
                    UPDATE pago 
                    SET observaciones = CONCAT(IFNULL(observaciones, ''), ' - Pago ${status} en Khipu')
                    WHERE reserva_id = ? 
                    AND observaciones LIKE '%${payment_id}%'
                    ORDER BY fecha_creacion DESC 
                    LIMIT 1
                `;

                connection.query(updatePagoFailedQuery, [reservaId], (err, result) => {
                    if (err) {
                        console.error('❌ Error al marcar pago como fallido:', err);
                    } else {
                        console.log('⚠️ Pago marcado como fallido en BD');
                    }
                });
            }

        } else if (status === 'pending') {
            // ⏳ Pago pendiente
            console.log(`⏳ Pago pendiente: ${payment_id}`);

        } else {
            // 🤷 Estado desconocido
            console.log(`🤷 Estado de pago desconocido: ${status}`);
        }

        // Registrar webhook en logs para auditoría
        console.log(`📊 Webhook procesado exitosamente - ${payment_id} [${status}]`);

        // Khipu espera respuesta 200 para confirmar recepción
        res.status(200).json({
            received: true,
            processed: true,
            payment_id: payment_id,
            status: status
        });

    } catch (error) {
        console.error('❌ Error procesando webhook Khipu:', error);

        // Aunque haya error interno, respondemos 200 para que Khipu no reintente
        res.status(200).json({
            received: true,
            processed: false,
            error: 'Error interno - webhook recibido pero no procesado'
        });
    }
});

// 📊 Obtener estadísticas de pagos Khipu
router.get('/estadisticas', (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as total_pagos,
            COUNT(CASE WHEN observaciones LIKE '%Pago confirmado por Khipu%' THEN 1 END) as pagos_confirmados,
            SUM(CASE WHEN observaciones LIKE '%Pago confirmado por Khipu%' THEN monto_total ELSE 0 END) as monto_total_khipu,
            COUNT(CASE WHEN metodo_pago = 'Khipu - Transferencia' THEN 1 END) as transferencias_khipu
        FROM pago 
        WHERE metodo_pago LIKE '%Khipu%' 
        OR observaciones LIKE '%Khipu%'
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener estadísticas:', err);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener estadísticas'
            });
        }

        const stats = results[0] || {};

        res.json({
            success: true,
            estadisticas: {
                total_pagos_khipu: stats.total_pagos || 0,
                pagos_confirmados: stats.pagos_confirmados || 0,
                monto_total: parseFloat(stats.monto_total_khipu) || 0,
                transferencias_completadas: stats.transferencias_khipu || 0
            }
        });
    });
});

// 🔍 Logs de webhooks (útil para debugging)
router.get('/webhook-logs', (req, res) => {
    // En producción podrías guardar los webhooks en una tabla separada
    // Por ahora retornamos información básica
    res.json({
        success: true,
        message: 'Los logs de webhooks se muestran en la consola del servidor',
        info: 'Para ver webhooks en tiempo real, revisa los logs del servidor'
    });
});

module.exports = router;
