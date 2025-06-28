const express = require('express');
const KhipuService = require('../services/KhipuService');
const connection = require('../config/database');
const router = express.Router();

const khipuService = new KhipuService();

// 🧪 Test de conexión con Khipu
router.get('/test-conexion', async (req, res) => {
    try {
        console.log('🔍 Probando conexión con Khipu...');

        const bancos = await khipuService.obtenerBancos();

        if (bancos.success) {
            res.json({
                success: true,
                message: '✅ Conexión con Khipu exitosa',
                receiver_id: process.env.KHIPU_RECEIVER_ID,
                bancos_disponibles: bancos.bancos?.length || 0,
                primer_banco: bancos.bancos?.[0]?.name || 'No disponible',
                configuracion: {
                    api_key_configurada: !!process.env.KHIPU_API_KEY,
                    receiver_id_configurado: !!process.env.KHIPU_RECEIVER_ID,
                    secret_configurado: !!process.env.KHIPU_SECRET
                }
            });
        } else {
            res.status(500).json({
                success: false,
                error: '❌ Error de conexión con Khipu',
                detalle: bancos.error
            });
        }
    } catch (error) {
        console.error('Error en test de conexión:', error);
        res.status(500).json({
            success: false,
            error: '❌ Error interno en test de conexión',
            detalle: error.message
        });
    }
});

// 🏦 Obtener bancos disponibles
router.get('/bancos', async (req, res) => {
    try {
        const resultado = await khipuService.obtenerBancos();

        if (resultado.success) {
            res.json({
                success: true,
                bancos: resultado.bancos
            });
        } else {
            res.status(500).json({
                success: false,
                error: resultado.error
            });
        }
    } catch (error) {
        console.error('Error al obtener bancos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// 💰 Crear pago para reserva
router.post('/crear-pago/:reservaId', async (req, res) => {
    const { reservaId } = req.params;
    const { monto, descripcion } = req.body;

    try {
        console.log(`💳 Creando pago Khipu para reserva ${reservaId}`);

        // Obtener datos completos de la reserva
        const queryReserva = `
            SELECT 
                r.id,
                r.fecha_reserva,
                r.cantidad_personas,
                r.razon,
                r.estado,
                c.nombre as cliente_nombre,
                c.correo as cliente_email,
                c.telefono as cliente_telefono,
                e.nombre as espacio_nombre,
                e.costo_base
            FROM reserva r
            JOIN cliente c ON r.cliente_id = c.id
            JOIN espacio e ON r.espacio_id = e.id
            WHERE r.id = ? AND r.estado != 'cancelada'
        `;

        connection.query(queryReserva, [reservaId], async (err, results) => {
            if (err) {
                console.error('Error al obtener datos de reserva:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Error al obtener datos de reserva'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Reserva no encontrada o cancelada'
                });
            }

            const reserva = results[0];

            // Verificar que el cliente tenga email
            if (!reserva.cliente_email) {
                return res.status(400).json({
                    success: false,
                    error: 'El cliente debe tener un email registrado para realizar pagos online'
                });
            }

            // Crear pago en Khipu
            const resultadoPago = await khipuService.crearPagoReserva({
                reservaId: reserva.id,
                monto: monto || reserva.costo_base,
                clienteEmail: reserva.cliente_email,
                clienteNombre: reserva.cliente_nombre,
                descripcion: descripcion || reserva.razon,
                fechaEvento: reserva.fecha_reserva,
                espacioNombre: reserva.espacio_nombre,
                cantidadPersonas: reserva.cantidad_personas
            });

            if (resultadoPago.success) {
                // Guardar referencia del pago en BD
                const insertPagoQuery = `
                    INSERT INTO pago (
                        monto_total, 
                        abono, 
                        metodo_pago, 
                        tipo_pago, 
                        observaciones, 
                        fecha_pago, 
                        reserva_id
                    ) VALUES (?, ?, 'Khipu', 'anticipo', ?, NOW(), ?)
                `;

                const observaciones = `Pago Khipu iniciado - ID: ${resultadoPago.payment_id}`;

                connection.query(insertPagoQuery, [
                    monto || reserva.costo_base,
                    monto || reserva.costo_base,
                    observaciones,
                    reservaId
                ], (err, result) => {
                    if (err) {
                        console.error('Error al guardar referencia de pago:', err);
                        // No retornamos error, el pago ya se creó en Khipu
                    }

                    res.json({
                        success: true,
                        message: '✅ Pago creado exitosamente',
                        payment_url: resultadoPago.payment_url,
                        payment_id: resultadoPago.payment_id,
                        simplified_transfer_url: resultadoPago.simplified_transfer_url,
                        expires_date: resultadoPago.expires_date,
                        reserva: {
                            id: reserva.id,
                            cliente: reserva.cliente_nombre,
                            evento: reserva.razon,
                            fecha: reserva.fecha_reserva,
                            espacio: reserva.espacio_nombre
                        }
                    });
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: resultadoPago.error
                });
            }
        });
    } catch (error) {
        console.error('Error al crear pago:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// 🔍 Consultar estado de pago
router.get('/consultar-pago/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;

        const resultado = await khipuService.consultarPago(paymentId);

        if (resultado.success) {
            res.json({
                success: true,
                pago: resultado.pago
            });
        } else {
            res.status(404).json({
                success: false,
                error: resultado.error
            });
        }
    } catch (error) {
        console.error('Error al consultar pago:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// 🔄 Reembolsar pago
router.post('/reembolsar/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { monto } = req.body;

        const resultado = await khipuService.reembolsarPago(paymentId, monto);

        if (resultado.success) {
            res.json({
                success: true,
                message: resultado.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: resultado.error
            });
        }
    } catch (error) {
        console.error('Error al reembolsar:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// 🧪 Crear pago de prueba
router.post('/pago-prueba', async (req, res) => {
    try {
        console.log('🧪 Creando pago de prueba...');

        const resultadoPago = await khipuService.crearPagoReserva({
            reservaId: 'TEST-' + Date.now(),
            monto: 1000,
            clienteEmail: 'test@elpatiodelea.cl',
            clienteNombre: 'Cliente Prueba',
            descripcion: '🧪 Pago de prueba - El Patio de LEA',
            fechaEvento: new Date(),
            espacioNombre: 'Salón de Pruebas',
            cantidadPersonas: 10
        });

        if (resultadoPago.success) {
            res.json({
                success: true,
                message: '✅ Pago de prueba creado exitosamente',
                payment_url: resultadoPago.payment_url,
                payment_id: resultadoPago.payment_id,
                instructions: 'Puedes usar este enlace para probar el flujo de pago completo'
            });
        } else {
            res.status(500).json({
                success: false,
                error: resultadoPago.error
            });
        }
    } catch (error) {
        console.error('Error en pago de prueba:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
