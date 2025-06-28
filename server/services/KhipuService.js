const axios = require('axios');

class KhipuService {
    constructor() {
        this.apiUrl = 'https://payment-api.khipu.com';
        this.apiKey = process.env.KHIPU_API_KEY;
        this.receiverId = process.env.KHIPU_RECEIVER_ID;
        this.secret = process.env.KHIPU_SECRET;
    }

    // Configurar headers para todas las peticiones
    getHeaders() {
        return {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    // Verificar configuración
    verificarConfiguracion() {
        if (!this.apiKey) {
            throw new Error('KHIPU_API_KEY no configurada');
        }
        if (!this.receiverId) {
            throw new Error('KHIPU_RECEIVER_ID no configurado');
        }
        if (!this.secret) {
            throw new Error('KHIPU_SECRET no configurado');
        }
    }

    // 1. Obtener bancos disponibles
    async obtenerBancos() {
        try {
            this.verificarConfiguracion();

            const response = await axios.get(`${this.apiUrl}/v3/banks`, {
                headers: this.getHeaders(),
                timeout: 10000
            });

            return {
                success: true,
                bancos: response.data.banks || []
            };
        } catch (error) {
            console.error('Error al obtener bancos Khipu:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // 2. Crear pago para reserva de El Patio de LEA
    async crearPagoReserva(datosReserva) {
        try {
            this.verificarConfiguracion();

            const {
                reservaId,
                monto,
                clienteEmail,
                clienteNombre,
                descripcion,
                fechaEvento,
                espacioNombre,
                cantidadPersonas
            } = datosReserva;

            // Validaciones básicas
            if (!reservaId || !monto || !clienteEmail) {
                throw new Error('Datos insuficientes para crear pago');
            }

            // 🧪 MODO PRUEBA: Validar límites de Khipu para cuenta de prueba
            // TODO: REMOVER estas validaciones cuando migres a cuenta de producción
            const MODO_PRUEBA = true; // Cambiar a false en producción

            let montoAjustado = parseFloat(monto);

            if (MODO_PRUEBA) {
                if (montoAjustado > 5000) {
                    console.warn(`⚠️ MODO PRUEBA: Monto $${montoAjustado} excede límite de Khipu. Ajustando a $5,000.`);
                    montoAjustado = 5000;
                }

                if (montoAjustado < 100) {
                    console.warn(`⚠️ MODO PRUEBA: Monto muy bajo $${montoAjustado}. Ajustando a $1,000.`);
                    montoAjustado = 1000;
                }

                console.log(`🧪 MODO PRUEBA ACTIVO - Monto ajustado: $${montoAjustado}`);
            }
            if (montoAjustado < 100) {
                console.warn(`⚠️ Monto muy bajo $${montoAjustado}. Ajustando a $1,000 para pruebas.`);
                montoAjustado = 1000;
            }

            const paymentData = {
                amount: montoAjustado,
                currency: 'CLP',
                subject: `🏡 El Patio de LEA - ${espacioNombre || 'Evento'}`,
                body: this.generarDescripcionEvento(descripcion, fechaEvento, espacioNombre, cantidadPersonas),
                transaction_id: `RESERVA-${reservaId}`,

                // URLs de retorno
                return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago-exitoso/${reservaId}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pago-cancelado`,

                // 🧪 MODO PRUEBA: No incluir notify_url porque localhost no es válido para Khipu
                // notify_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/khipu/webhook`,

                // Datos del cliente
                payer_email: clienteEmail,
                payer_name: clienteNombre || 'Cliente',
                send_email: true, // Enviar email de confirmación

                // Configuración
                notify_api_version: '3.0',
                expires_date: this.calcularFechaExpiracion(24), // 24 horas para pagar
            };

            console.log('🔄 Creando pago en Khipu:', {
                monto: paymentData.amount,
                reserva: reservaId,
                cliente: clienteEmail
            });

            const response = await axios.post(
                `${this.apiUrl}/v3/payments`,
                paymentData,
                {
                    headers: this.getHeaders(),
                    timeout: 15000
                }
            );

            console.log('✅ Respuesta completa de Khipu:', JSON.stringify(response.data, null, 2));

            // Verificar que la respuesta contiene los datos necesarios
            if (!response.data.payment_id || !response.data.payment_url) {
                console.error('❌ Respuesta de Khipu incompleta:', response.data);
                throw new Error('Khipu no devolvió payment_id o payment_url');
            }

            console.log('✅ Pago creado exitosamente en Khipu:', response.data.payment_id);

            return {
                success: true,
                payment_id: response.data.payment_id,
                payment_url: response.data.payment_url,
                simplified_transfer_url: response.data.simplified_transfer_url,
                expires_date: paymentData.expires_date
            };

        } catch (error) {
            console.error('❌ Error al crear pago en Khipu:', error.response?.data || error.message);

            // Manejar errores específicos de Khipu
            if (error.response?.data) {
                const khipuError = error.response.data;

                // Si hay errores de validación, extraer el mensaje específico
                if (khipuError.errors && Array.isArray(khipuError.errors)) {
                    const errorMessages = khipuError.errors.map(err => `${err.field}: ${err.message}`);
                    return {
                        success: false,
                        error: `Error de validación en Khipu: ${errorMessages.join(', ')}`
                    };
                }

                return {
                    success: false,
                    error: khipuError.message || 'Error desconocido de Khipu'
                };
            }

            return {
                success: false,
                error: error.message || 'Error de conexión con Khipu'
            };
        }
    }

    // 3. Consultar estado de pago
    async consultarPago(paymentId) {
        try {
            this.verificarConfiguracion();

            const response = await axios.get(
                `${this.apiUrl}/v3/payments/${paymentId}`,
                {
                    headers: this.getHeaders(),
                    timeout: 10000
                }
            );

            return {
                success: true,
                pago: response.data
            };
        } catch (error) {
            console.error('Error al consultar pago:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // 4. Reembolsar pago
    async reembolsarPago(paymentId, monto = null) {
        try {
            this.verificarConfiguracion();

            const refundData = monto ? { amount: parseFloat(monto) } : {};

            const response = await axios.post(
                `${this.apiUrl}/v3/payments/${paymentId}/refunds`,
                refundData,
                {
                    headers: this.getHeaders(),
                    timeout: 15000
                }
            );

            return {
                success: true,
                message: response.data.message || 'Reembolso procesado exitosamente'
            };
        } catch (error) {
            console.error('Error al reembolsar:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // 5. Predecir si un pago será exitoso (Machine Learning de Khipu)
    async predecirPago(email, bankId, monto) {
        try {
            this.verificarConfiguracion();

            const response = await axios.get(`${this.apiUrl}/v3/predict`, {
                headers: this.getHeaders(),
                params: {
                    payer_email: email,
                    bank_id: bankId,
                    amount: monto,
                    currency: 'CLP'
                },
                timeout: 10000
            });

            return {
                success: true,
                prediccion: response.data
            };
        } catch (error) {
            console.error('Error en predicción:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    // Funciones auxiliares

    generarDescripcionEvento(descripcion, fechaEvento, espacioNombre, cantidadPersonas) {
        let desc = `🎉 ${descripcion || 'Evento'}\n`;
        desc += `📍 Centro de Eventos El Patio de LEA, Cañete\n`;

        if (espacioNombre) {
            desc += `🏠 Espacio: ${espacioNombre}\n`;
        }

        if (fechaEvento) {
            const fecha = new Date(fechaEvento);
            desc += `📅 Fecha: ${fecha.toLocaleDateString('es-CL')}\n`;
        }

        if (cantidadPersonas) {
            desc += `👥 Personas: ${cantidadPersonas}\n`;
        }

        desc += `\n¡Gracias por elegir El Patio de LEA! 🌿`;

        return desc;
    }

    calcularFechaExpiracion(horas) {
        const fecha = new Date();
        fecha.setHours(fecha.getHours() + horas);
        return fecha.toISOString();
    }

    // Verificar webhook signature (opcional pero recomendado)
    verificarWebhookSignature(payload, signature) {
        // Implementar verificación de firma si Khipu la proporciona
        // Por ahora retornamos true, pero en producción debería validarse
        return true;
    }
}

module.exports = KhipuService;
