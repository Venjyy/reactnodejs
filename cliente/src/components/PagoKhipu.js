import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';

const PagoKhipu = ({ reservaData, onPagoExitoso, onCancelar }) => {
    const [cargando, setCargando] = useState(false);
    const [bancos, setBancos] = useState([]);
    const [mostrarBancos, setMostrarBancos] = useState(false);

    // Validación de datos de reserva
    if (!reservaData || !reservaData.reservaId) {
        console.error('❌ PagoKhipu: reservaData no válido:', reservaData);
        return (
            <div className="pago-khipu-container">
                <div className="error-container">
                    <h3>⚠️ Error en los datos de reserva</h3>
                    <p>No se pudieron cargar los datos de la reserva. Por favor, intenta nuevamente.</p>
                    <button onClick={onCancelar} className="btn-cancelar">
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    // Obtener bancos disponibles
    const cargarBancos = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/khipu/bancos');
            if (response.data.success) {
                setBancos(response.data.bancos);
                setMostrarBancos(true);
            }
        } catch (error) {
            console.error('Error al cargar bancos:', error);
            Swal.fire({
                title: '⚠️ Error',
                text: 'No se pudieron cargar los bancos disponibles',
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
        }
    };

    // Crear pago con Khipu
    const crearPagoKhipu = async () => {
        setCargando(true);

        try {
            // Validar que tenemos todos los datos necesarios
            if (!reservaData || !reservaData.reservaId) {
                throw new Error('Datos de reserva no válidos');
            }

            // Calcular monto total
            const montoEspacio = parseFloat(reservaData.espacioCosto) || 0;
            const montoServicios = (reservaData.serviciosSeleccionados || []).reduce((total, servicio) => {
                const costoServicio = parseFloat(servicio.precio || servicio.costo || 0);
                return total + costoServicio;
            }, 0);
            let montoTotal = montoEspacio + montoServicios;

            // 🧪 MODO PRUEBA: Limitar monto para cuenta de prueba de Khipu
            // TODO: REMOVER estas validaciones cuando migres a cuenta de producción
            const MODO_PRUEBA = true; // Cambiar a false en producción

            if (MODO_PRUEBA) {
                if (montoTotal > 5000) {
                    console.warn(`⚠️ MODO PRUEBA: Monto original $${montoTotal} excede límite de Khipu. Ajustando a $5,000.`);
                    montoTotal = 5000;
                }

                // Si el monto es menor a $100, usar monto mínimo
                if (montoTotal < 100) {
                    console.warn(`⚠️ MODO PRUEBA: Monto muy bajo $${montoTotal}. Ajustando a $1,000.`);
                    montoTotal = 1000;
                }

                console.log(`🧪 MODO PRUEBA ACTIVO - Monto ajustado: $${montoTotal}`);
            }

            const datosPago = {
                monto: montoTotal,
                descripcion: `${reservaData.razon} - ${reservaData.espacioNombre}`
            };

            console.log('🔄 Creando pago Khipu para reserva:', reservaData.reservaId);

            const response = await axios.post(
                `http://localhost:3001/api/khipu/crear-pago/${reservaData.reservaId}`,
                datosPago
            );

            if (response.data.success) {
                // Validar que recibimos los datos necesarios del pago
                if (!response.data.payment_id || !response.data.payment_url) {
                    console.error('❌ Respuesta de Khipu incompleta:', response.data);
                    throw new Error('La respuesta de Khipu no contiene payment_id o payment_url');
                }

                console.log('✅ Pago creado correctamente:', {
                    payment_id: response.data.payment_id,
                    payment_url: response.data.payment_url
                });

                // Cerrar el modal de Khipu inmediatamente
                if (onCancelar) {
                    onCancelar();
                }

                // Mostrar confirmación y redirigir a Khipu después de cerrar el modal
                setTimeout(async () => {
                    const result = await Swal.fire({
                        title: '🏦 Pago con Khipu',
                        html: `
                            <div style="text-align: left; font-size: 14px;">
                                <h4 style="color: #4ECDC4; margin-bottom: 15px;">🎉 ¡Reserva creada exitosamente!</h4>
                                
                                <div style="background: #f8f9ff; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                                    <strong>📋 Detalles de tu reserva:</strong><br>
                                    <span style="color: #666;">Cliente:</span> <strong>${reservaData.clienteNombre}</strong><br>
                                    <span style="color: #666;">Evento:</span> <strong>${reservaData.razon}</strong><br>
                                    <span style="color: #666;">Fecha:</span> <strong>${new Date(reservaData.fecha).toLocaleDateString('es-CL')}</strong><br>
                                    <span style="color: #666;">Espacio:</span> <strong>${reservaData.espacioNombre}</strong><br>
                                    <span style="color: #666;">Personas:</span> <strong>${reservaData.personas}</strong>
                                </div>
                                
                                <div style="background: #e8f5e8; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                                    <strong>💰 Total a pagar:</strong> <span style="color: #27ae60; font-size: 18px; font-weight: bold;">$${montoTotal.toLocaleString('es-CL')} CLP</span>
                                </div>
                                
                                <div style="background: #fff3e0; padding: 15px; border-radius: 10px;">
                                    <strong>🏦 Transferencia Bancaria Instantánea</strong><br>
                                    <span style="color: #666;">• Transferencia directa desde tu banco</span><br>
                                    <span style="color: #666;">• Sin necesidad de tarjetas</span><br>
                                    <span style="color: #666;">• Confirmación inmediata</span><br>
                                    <span style="color: #666;">• Comisión: solo 0.95% + IVA</span>
                                </div>
                            </div>
                        `,
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: '🏦 Pagar con Khipu',
                        cancelButtonText: '❌ Cancelar',
                        confirmButtonColor: '#4ECDC4',
                        cancelButtonColor: '#e74c3c',
                        allowOutsideClick: false,
                        customClass: {
                            popup: 'swal-wide'
                        }
                    });

                    if (result.isConfirmed) {
                        // Validar que tenemos la URL de pago
                        if (!response.data.payment_url) {
                            Swal.fire({
                                title: '❌ Error de configuración',
                                text: 'No se pudo obtener la URL de pago de Khipu. Por favor contacta al administrador.',
                                icon: 'error',
                                confirmButtonText: 'Entendido',
                                confirmButtonColor: '#e74c3c'
                            });
                            return;
                        }

                        // Redirigir a Khipu para el pago
                        console.log('🔗 Redirigiendo a Khipu:', response.data.payment_url);

                        // Guardar datos para el retorno
                        localStorage.setItem('reservaPendiente', JSON.stringify({
                            reservaId: reservaData.reservaId,
                            paymentId: response.data.payment_id,
                            monto: montoTotal
                        }));

                        // Abrir Khipu en nueva ventana
                        window.open(response.data.payment_url, '_blank');

                        // Mostrar mensaje de seguimiento
                        Swal.fire({
                            title: '⏳ Pago en proceso',
                            html: `
                                <div style="text-align: center;">
                                    <p>Se abrió una nueva ventana para realizar el pago.</p>
                                    <p><strong>Reserva ID:</strong> ${reservaData.reservaId}</p>
                                    <p><strong>Payment ID:</strong> ${response.data.payment_id}</p>
                                    <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin-top: 15px;">
                                        <small>💡 <strong>Tip:</strong> Una vez completado el pago, tu reserva será confirmada automáticamente.</small>
                                    </div>
                                </div>
                            `,
                            icon: 'info',
                            confirmButtonText: 'Entendido',
                            confirmButtonColor: '#4ECDC4'
                        });

                        // Llamar callback de éxito
                        if (onPagoExitoso) {
                            onPagoExitoso({
                                paymentId: response.data.payment_id,
                                paymentUrl: response.data.payment_url,
                                reservaId: reservaData.reservaId
                            });
                        }
                    }
                }, 300); // Pequeño delay para permitir que el modal se cierre completamente
            } else {
                throw new Error(response.data.error || 'Error al crear pago');
            }

        } catch (error) {
            console.error('❌ Error al crear pago:', error);

            Swal.fire({
                title: '❌ Error al crear pago',
                text: error.response?.data?.error || error.message || 'Error desconocido',
                icon: 'error',
                confirmButtonText: 'Reintentar',
                confirmButtonColor: '#e74c3c'
            });
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="pago-khipu-container">
            <div className="pago-khipu-header">
                <h3>🏦 Pago con Khipu</h3>
                <p>Transferencia bancaria instantánea y segura</p>
            </div>

            <div className="pago-khipu-content">
                <div className="resumen-pago">
                    <h4>📋 Resumen del pago</h4>
                    <div className="pago-detalle">
                        <span>Espacio ({reservaData.espacioNombre}):</span>
                        <span>${parseFloat(reservaData.espacioCosto || 0).toLocaleString('es-CL')}</span>
                    </div>

                    {reservaData.serviciosSeleccionados && reservaData.serviciosSeleccionados.length > 0 && (
                        <div className="servicios-detalle">
                            <strong>Servicios adicionales:</strong>
                            {reservaData.serviciosSeleccionados.map((servicio, index) => (
                                <div key={servicio.id || `servicio-${index}`} className="pago-detalle">
                                    <span>{servicio.nombre}:</span>
                                    <span>${parseFloat(servicio.precio || servicio.costo || 0).toLocaleString('es-CL')}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pago-total">
                        <strong>
                            <span>Total:</span>
                            <span>
                                ${(
                                    parseFloat(reservaData.espacioCosto || 0) +
                                    (reservaData.serviciosSeleccionados?.reduce((total, servicio) =>
                                        total + parseFloat(servicio.precio || servicio.costo || 0), 0) || 0)
                                ).toLocaleString('es-CL')} CLP
                            </span>
                        </strong>
                    </div>
                </div>

                <div className="khipu-info">
                    <h4>✨ Ventajas de pagar con Khipu</h4>
                    <ul>
                        <li>🏦 Transferencia directa desde tu banco</li>
                        <li>💳 Sin necesidad de tarjetas de crédito</li>
                        <li>⚡ Confirmación instantánea</li>
                        <li>🔒 Transacción 100% segura</li>
                        <li>💰 Comisión baja: solo 0.95% + IVA</li>
                        <li>📱 Compatible con banca móvil</li>
                    </ul>
                </div>

                {mostrarBancos && bancos.length > 0 && (
                    <div className="bancos-disponibles">
                        <h4>🏦 Bancos disponibles ({bancos.length})</h4>
                        <div className="bancos-grid">
                            {bancos.slice(0, 8).map(banco => (
                                <div key={banco.id} className="banco-item">
                                    <img src={banco.logo_url} alt={banco.name} />
                                    <span>{banco.name}</span>
                                </div>
                            ))}
                            {bancos.length > 8 && (
                                <div className="banco-item mas-bancos">
                                    <span>+{bancos.length - 8} más</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="pago-khipu-acciones">
                <button
                    className="btn btn-khipu"
                    onClick={crearPagoKhipu}
                    disabled={cargando}
                >
                    {cargando ? (
                        <>🔄 Creando pago...</>
                    ) : (
                        <>🏦 Pagar con Khipu</>
                    )}
                </button>

                <button
                    className="btn btn-bancos"
                    onClick={cargarBancos}
                    disabled={cargando}
                >
                    🏦 Ver bancos disponibles
                </button>

                <button
                    className="btn btn-cancelar"
                    onClick={onCancelar}
                    disabled={cargando}
                >
                    ❌ Cancelar
                </button>
            </div>
        </div>
    );
};

export default PagoKhipu;
