import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import './Sections.css';

function Dashboard() {
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalReservas: 0,
        reservasHoy: 0,
        ingresosMes: 0
    });

    const [reservasRecientes, setReservasRecientes] = useState([]);
    const [resumenFinanciero, setResumenFinanciero] = useState({
        ingresosMes: 0,
        pagosPendientes: 0,
        proyeccionMensual: 0
    });
    const [espaciosRanking, setEspaciosRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para modales de acciones rápidas
    const [modalActivo, setModalActivo] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [espacios, setEspacios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [reservasParaPago, setReservasParaPago] = useState([]);

    // Estados para formularios
    const [formCliente, setFormCliente] = useState({
        nombre: '',
        rut: '',
        correo: '',
        telefono: ''
    });

    const [formReserva, setFormReserva] = useState({
        clienteId: '',
        espacioId: '',
        fechaEvento: '',
        horaInicio: '',
        tipoEvento: '',
        numeroPersonas: '',
        serviciosSeleccionados: [],
        observaciones: ''
    });

    const [formPago, setFormPago] = useState({
        reservaId: '',
        monto: '',
        metodoPago: 'efectivo',
        fechaPago: new Date().toISOString().split('T')[0],
        observaciones: ''
    });

    const API_BASE_URL = 'http://localhost:3001';

    const loadDashboardStats = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
            if (!response.ok) {
                throw new Error('Error al obtener estadísticas');
            }
            const data = await response.json();
            console.log('Stats cargadas:', data);
            setStats({
                totalClientes: data.totalClientes || 0,
                totalReservas: data.totalReservas || 0,
                reservasHoy: data.reservasHoy || 0,
                ingresosMes: data.ingresosMes || 0
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    }, []);

    const loadReservasRecientes = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/reservas-recientes`);
            if (!response.ok) {
                throw new Error('Error al obtener reservas recientes');
            }
            const data = await response.json();
            console.log('Reservas recientes cargadas:', data);
            setReservasRecientes(data);
        } catch (error) {
            console.error('Error al cargar reservas recientes:', error);
            setReservasRecientes([]);
        }
    }, []);

    const loadResumenFinanciero = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/resumen-financiero`);
            if (!response.ok) {
                throw new Error('Error al obtener resumen financiero');
            }
            const data = await response.json();
            console.log('Resumen financiero cargado:', data);
            setResumenFinanciero({
                ingresosMes: Number(data.ingresosMes) || 0,
                pagosPendientes: Number(data.pagosPendientes) || 0,
                proyeccionMensual: Number(data.proyeccionMensual) || 0
            });
        } catch (error) {
            console.error('Error al cargar resumen financiero:', error);
            setResumenFinanciero({
                ingresosMes: 0,
                pagosPendientes: 0,
                proyeccionMensual: 0
            });
        }
    }, []);

    const loadEspaciosRanking = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/espacios-ranking`);
            if (!response.ok) {
                throw new Error('Error al obtener ranking de espacios');
            }
            const data = await response.json();
            console.log('Ranking de espacios cargado:', data);
            setEspaciosRanking(data);
        } catch (error) {
            console.error('Error al cargar ranking de espacios:', error);
            setEspaciosRanking([]);
        }
    }, []);

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Cargando datos del dashboard...');

            await Promise.all([
                loadDashboardStats(),
                loadReservasRecientes(),
                loadResumenFinanciero(),
                loadEspaciosRanking()
            ]);

            console.log('Todos los datos del dashboard cargados');
        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
            setError('Error al cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
    }, [loadDashboardStats, loadReservasRecientes, loadResumenFinanciero, loadEspaciosRanking]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Cargar datos necesarios para los modales
    const loadModalData = async (tipo) => {
        try {
            if (tipo === 'reserva' || tipo === 'pago') {
                // Cargar clientes
                const clientesRes = await fetch(`${API_BASE_URL}/api/clientes`);
                if (clientesRes.ok) {
                    const clientesData = await clientesRes.json();
                    setClientes(clientesData);
                }

                // Cargar espacios
                const espaciosRes = await fetch(`${API_BASE_URL}/espacios`);
                if (espaciosRes.ok) {
                    const espaciosData = await espaciosRes.json();
                    setEspacios(espaciosData);
                }

                // Cargar servicios
                const serviciosRes = await fetch(`${API_BASE_URL}/api/servicios`);
                if (serviciosRes.ok) {
                    const serviciosData = await serviciosRes.json();
                    setServicios(serviciosData.filter(s => s.disponible));
                }
            }

            if (tipo === 'pago') {
                // Cargar reservas pendientes de pago usando el nuevo endpoint
                const reservasRes = await fetch(`${API_BASE_URL}/dashboard/reservas-para-pagos`);
                if (reservasRes.ok) {
                    const reservasData = await reservasRes.json();
                    console.log('Reservas para pago cargadas:', reservasData);
                    setReservasParaPago(reservasData);
                } else {
                    console.error('Error al cargar reservas para pago');
                    setReservasParaPago([]);
                }
            }
        } catch (error) {
            console.error('Error cargando datos del modal:', error);
        }
    };

    // Funciones de utilidad
    const formatFecha = (fecha) => {
        const fechaObj = new Date(fecha);
        return fechaObj.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatearDinero = (monto) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(monto);
    };

    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'confirmada':
                return 'badge-success';
            case 'pendiente':
                return 'badge-warning';
            case 'cancelada':
                return 'badge-danger';
            default:
                return 'badge-secondary';
        }
    };

    const getClienteIniciales = (nombre) => {
        return nombre.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
    };

    // Funciones para abrir modales
    const abrirModalNuevaReserva = async () => {
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';
        await loadModalData('reserva');
        setModalActivo('nuevaReserva');
    };

    const abrirModalNuevoCliente = () => {
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';
        setModalActivo('nuevoCliente');
    };

    const abrirModalRegistrarPago = async () => {
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';
        await loadModalData('pago');
        setModalActivo('registrarPago');
    };

    const abrirReportes = () => {
        const event = new CustomEvent('cambiarSeccion', { detail: 'reportes' });
        window.dispatchEvent(event);
    };

    const cerrarModal = () => {
        // Restaurar scroll del body
        document.body.style.overflow = 'unset';

        setModalActivo(null);
        // Limpiar formularios
        setFormCliente({ nombre: '', rut: '', correo: '', telefono: '' });
        setFormReserva({
            clienteId: '',
            espacioId: '',
            fechaEvento: '',
            horaInicio: '',
            tipoEvento: '',
            numeroPersonas: '',
            serviciosSeleccionados: [],
            observaciones: ''
        });
        setFormPago({
            reservaId: '',
            monto: '',
            metodoPago: 'efectivo',
            fechaPago: new Date().toISOString().split('T')[0],
            observaciones: ''
        });
    };

    // Funciones para enviar formularios
    const crearCliente = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formCliente)
            });

            // Cerrar modal antes de mostrar alertas (esto restaurará el scroll)
            cerrarModal();

            if (response.ok) {
                await Swal.fire({
                    title: '¡Éxito!',
                    text: 'Cliente creado exitosamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });
                loadDashboardData();
            } else {
                const error = await response.json();
                await Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudo crear el cliente',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            cerrarModal();
            await Swal.fire({
                title: 'Error de conexión',
                text: 'Error al crear cliente. Verifique su conexión.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    const crearReserva = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/crearReserva`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clienteId: formReserva.clienteId,
                    espacioId: formReserva.espacioId,
                    fecha: formReserva.fechaEvento,
                    horario: formReserva.horaInicio,
                    personas: formReserva.numeroPersonas,
                    razon: formReserva.tipoEvento,
                    servicios: formReserva.serviciosSeleccionados
                })
            });

            // Cerrar el modal ANTES de mostrar cualquier alerta (esto restaurará el scroll)
            cerrarModal();

            if (response.ok) {
                await Swal.fire({
                    title: '¡Reserva Creada!',
                    text: 'La reserva se ha creado exitosamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });
                loadDashboardData();
            } else {
                const error = await response.json();
                await Swal.fire({
                    title: 'Error al crear reserva',
                    text: error.error || 'No se pudo crear la reserva',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            // Asegurar que el modal esté cerrado también en caso de error (esto restaurará el scroll)
            cerrarModal();
            await Swal.fire({
                title: 'Error de conexión',
                text: 'Error al crear reserva. Verifique su conexión.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    const registrarPago = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/pagos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservaId: formPago.reservaId,
                    monto: parseFloat(formPago.monto),
                    metodoPago: formPago.metodoPago,
                    fechaPago: formPago.fechaPago,
                    observaciones: formPago.observaciones
                })
            });

            // Cerrar modal antes de mostrar alertas (esto restaurará el scroll)
            cerrarModal();

            if (response.ok) {
                await Swal.fire({
                    title: '¡Pago Registrado!',
                    text: 'El pago se ha registrado exitosamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });
                loadDashboardData();
            } else {
                const error = await response.json();
                await Swal.fire({
                    title: 'Error al registrar pago',
                    text: error.message || 'No se pudo registrar el pago',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            cerrarModal();
            await Swal.fire({
                title: 'Error de conexión',
                text: 'Error al registrar pago. Verifique su conexión.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    // Efecto para limpiar el scroll al desmontar el componente
    useEffect(() => {
        return () => {
            // Asegurar que el scroll se restaure al desmontar el componente
            document.body.style.overflow = 'unset';
        };
    }, []);


    if (loading) {
        return (
            <div className="section-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando datos del dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="section-container">
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={loadDashboardData} className="btn-retry">
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-content">
                    <h1>
                        <span className="section-icon">📊</span>
                        Dashboard - Centro de Eventos
                    </h1>
                    <p>Resumen general del sistema</p>
                </div>
                <button onClick={loadDashboardData} className="btn-refresh">
                    🔄 Actualizar
                </button>
            </div>

            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <div>
                        <h3>{stats.totalClientes}</h3>
                        <p>Total Clientes</p>
                        <small className="stat-trend positive">Registrados</small>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>{stats.totalReservas}</h3>
                        <p>Total Reservas</p>
                        <small className="stat-trend positive">Históricas</small>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">⏰</span>
                    <div>
                        <h3>{stats.reservasHoy}</h3>
                        <p>Reservas Hoy</p>
                        <small className="stat-trend neutral">Programadas</small>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <div>
                        <h3>${formatearDinero(stats.ingresosMes)}</h3>
                        <p>Ingresos del Mes</p>
                        <small className="stat-trend positive">Confirmados</small>
                    </div>
                </div>
            </div>
            <div className="section-content">
                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h2>
                            <span className="section-icon">📋</span>
                            Próximas Reservas
                        </h2>
                        <div className="recent-bookings">
                            {reservasRecientes.length > 0 ? (
                                reservasRecientes.map((reserva) => (
                                    <div key={reserva.id} className="booking-item">
                                        <div className="booking-info">
                                            <div className="client-info">
                                                <div className="client-avatar">
                                                    {getClienteIniciales(reserva.cliente_nombre)}
                                                </div>
                                                <div className="client-details">
                                                    <div className="client-name">
                                                        {reserva.cliente_nombre}
                                                    </div>
                                                    <div className="booking-details">
                                                        {reserva.espacio_nombre} • {reserva.razon}
                                                    </div>
                                                    <div className="booking-date">
                                                        {formatFecha(reserva.fecha_reserva)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="booking-status">
                                            <span className={`badge ${getEstadoBadge(reserva.estado)}`}>
                                                {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    <p>No hay reservas próximas</p>
                                </div>
                            )}
                        </div>
                        <div className="card-footer">
                            <button className="btn-view" onClick={() => {
                                const event = new CustomEvent('cambiarSeccion', { detail: 'reservas' });
                                window.dispatchEvent(event);
                            }}>
                                Ver todas las reservas
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h2>
                            <span className="section-icon">⚡</span>
                            Acciones Rápidas
                        </h2>
                        <div className="quick-actions">
                            <button className="action-btn primary" onClick={abrirModalNuevaReserva}>
                                <span>📅</span>
                                <div>
                                    <strong>Nueva Reserva</strong>
                                    <small>Crear una nueva reserva</small>
                                </div>
                            </button>
                            <button className="action-btn secondary" onClick={abrirModalNuevoCliente}>
                                <span>👤</span>
                                <div>
                                    <strong>Nuevo Cliente</strong>
                                    <small>Registrar cliente</small>
                                </div>
                            </button>
                            <button className="action-btn tertiary" onClick={abrirModalRegistrarPago}>
                                <span>💰</span>
                                <div>
                                    <strong>Registrar Pago</strong>
                                    <small>Procesar pago</small>
                                </div>
                            </button>
                            <button className="action-btn quaternary" onClick={abrirReportes}>
                                <span>📊</span>
                                <div>
                                    <strong>Ver Reportes</strong>
                                    <small>Análisis y estadísticas</small>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h2>
                            <span className="section-icon">📈</span>
                            Resumen Financiero
                        </h2>
                        <div className="financial-summary">
                            <div className="financial-item">
                                <span className="financial-label">Ingresos este mes</span>
                                <span className="financial-amount positive">
                                    ${formatearDinero(resumenFinanciero.ingresosMes)}
                                </span>
                            </div>
                            <div className="financial-item">
                                <span className="financial-label">Pagos pendientes</span>
                                <span className="financial-amount warning">
                                    ${formatearDinero(resumenFinanciero.pagosPendientes)}
                                </span>
                            </div>
                            <div className="financial-item">
                                <span className="financial-label">Proyección mensual</span>
                                <span className="financial-amount positive">
                                    ${formatearDinero(resumenFinanciero.proyeccionMensual)}
                                </span>
                            </div>
                        </div>
                        <div className="card-footer">
                            <button className="btn-view" onClick={() => {
                                const event = new CustomEvent('cambiarSeccion', { detail: 'pagos' });
                                window.dispatchEvent(event);
                            }}>
                                Ver detalles financieros
                            </button>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h2>
                            <span className="section-icon">📊</span>
                            Espacios Más Utilizados
                        </h2>
                        <div className="spaces-ranking">
                            {espaciosRanking.length > 0 ? (
                                espaciosRanking.map((espacio, index) => (
                                    <div key={index} className="ranking-item">
                                        <span className="ranking-number">{index + 1}</span>
                                        <div className="ranking-info">
                                            <strong>{espacio.nombre}</strong>
                                            <small>{espacio.total_reservas} reservas este mes</small>
                                        </div>
                                        <div className="ranking-percentage">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${espacio.porcentaje || 0}%` }}
                                                ></div>
                                            </div>
                                            <span>{espacio.porcentaje || 0}%</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    <p>No hay datos de espacios disponibles</p>
                                </div>
                            )}
                        </div>
                        <div className="card-footer">
                            <button className="btn-view" onClick={() => {
                                const event = new CustomEvent('cambiarSeccion', { detail: 'espacios' });
                                window.dispatchEvent(event);
                            }}>
                                Ver todos los espacios
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALES */}
            {modalActivo && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                        {/* Modal Nuevo Cliente */}
                        {modalActivo === 'nuevoCliente' && (
                            <div className="modal-header-content">
                                <h3>
                                    <span>👤</span>
                                    Nuevo Cliente
                                </h3>
                                <button className="modal-close" onClick={cerrarModal}>×</button>

                                <form onSubmit={crearCliente} className="modal-form">
                                    <div className="form-group">
                                        <label>Nombre completo *</label>
                                        <input
                                            type="text"
                                            value={formCliente.nombre}
                                            onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>RUT *</label>
                                        <input
                                            type="text"
                                            value={formCliente.rut}
                                            onChange={(e) => setFormCliente({ ...formCliente, rut: e.target.value })}
                                            placeholder="12.345.678-9"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Correo electrónico *</label>
                                        <input
                                            type="email"
                                            value={formCliente.correo}
                                            onChange={(e) => setFormCliente({ ...formCliente, correo: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Teléfono</label>
                                        <input
                                            type="tel"
                                            value={formCliente.telefono}
                                            onChange={(e) => setFormCliente({ ...formCliente, telefono: e.target.value })}
                                            placeholder="+56 9 1234 5678"
                                        />
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" onClick={cerrarModal} className="btn-secondary">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn-primary">
                                            Crear Cliente
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Modal Nueva Reserva */}
                        {modalActivo === 'nuevaReserva' && (
                            <div className="modal-header-content">
                                <h3>
                                    <span>📅</span>
                                    Nueva Reserva
                                </h3>
                                <button className="modal-close" onClick={cerrarModal}>×</button>

                                <form onSubmit={crearReserva} className="modal-form">
                                    <div className="form-group">
                                        <label>Cliente *</label>
                                        <select
                                            value={formReserva.clienteId}
                                            onChange={(e) => setFormReserva({ ...formReserva, clienteId: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar cliente</option>
                                            {clientes.map(cliente => (
                                                <option key={cliente.id} value={cliente.id}>
                                                    {cliente.nombre} - {cliente.rut}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Espacio *</label>
                                        <select
                                            value={formReserva.espacioId}
                                            onChange={(e) => setFormReserva({ ...formReserva, espacioId: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar espacio</option>
                                            {espacios.map(espacio => (
                                                <option key={espacio.id} value={espacio.id}>
                                                    {espacio.nombre} (Cap. {espacio.capacidad})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Fecha del evento *</label>
                                            <input
                                                type="date"
                                                value={formReserva.fechaEvento}
                                                onChange={(e) => setFormReserva({ ...formReserva, fechaEvento: e.target.value })}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Hora de inicio *</label>
                                            <input
                                                type="time"
                                                value={formReserva.horaInicio}
                                                onChange={(e) => setFormReserva({ ...formReserva, horaInicio: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Tipo de evento *</label>
                                            <input
                                                type="text"
                                                value={formReserva.tipoEvento}
                                                onChange={(e) => setFormReserva({ ...formReserva, tipoEvento: e.target.value })}
                                                placeholder="Cumpleaños, matrimonio, etc."
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Número de personas *</label>
                                            <input
                                                type="number"
                                                value={formReserva.numeroPersonas}
                                                onChange={(e) => setFormReserva({ ...formReserva, numeroPersonas: e.target.value })}
                                                min="1"
                                                max="100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {servicios.length > 0 && (
                                        <div className="form-group">
                                            <label>Servicios adicionales</label>
                                            <div className="checkbox-group">
                                                {servicios.map(servicio => (
                                                    <label key={servicio.id} className="checkbox-item">
                                                        <input
                                                            type="checkbox"
                                                            checked={formReserva.serviciosSeleccionados.includes(servicio.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setFormReserva({
                                                                        ...formReserva,
                                                                        serviciosSeleccionados: [...formReserva.serviciosSeleccionados, servicio.id]
                                                                    });
                                                                } else {
                                                                    setFormReserva({
                                                                        ...formReserva,
                                                                        serviciosSeleccionados: formReserva.serviciosSeleccionados.filter(id => id !== servicio.id)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <span>{servicio.nombre} - ${formatearDinero(servicio.precio)}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Observaciones</label>
                                        <textarea
                                            value={formReserva.observaciones}
                                            onChange={(e) => setFormReserva({ ...formReserva, observaciones: e.target.value })}
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" onClick={cerrarModal} className="btn-secondary">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn-primary">
                                            Crear Reserva
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Modal Registrar Pago */}
                        {modalActivo === 'registrarPago' && (
                            <div className="modal-header-content">
                                <h3>
                                    <span>💰</span>
                                    Registrar Pago
                                </h3>
                                <button className="modal-close" onClick={cerrarModal}>×</button>

                                <form onSubmit={registrarPago} className="modal-form">
                                    <div className="form-group">
                                        <label>Reserva *</label>
                                        <select
                                            value={formPago.reservaId}
                                            onChange={(e) => setFormPago({ ...formPago, reservaId: e.target.value })}
                                            required
                                        >
                                            <option value="">Seleccionar reserva</option>
                                            {reservasParaPago.map(reserva => (
                                                <option key={reserva.id} value={reserva.id}>
                                                    {reserva.cliente_nombre} - {formatFecha(reserva.fecha_reserva)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Monto *</label>
                                            <input
                                                type="number"
                                                value={formPago.monto}
                                                onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })}
                                                min="1000"
                                                step="1000"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Método de pago *</label>
                                            <select
                                                value={formPago.metodoPago}
                                                onChange={(e) => setFormPago({ ...formPago, metodoPago: e.target.value })}
                                                required
                                            >
                                                <option value="efectivo">Efectivo</option>
                                                <option value="transferencia">Transferencia</option>
                                                <option value="tarjeta">Tarjeta</option>
                                                <option value="cheque">Cheque</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Fecha de pago *</label>
                                        <input
                                            type="date"
                                            value={formPago.fechaPago}
                                            onChange={(e) => setFormPago({ ...formPago, fechaPago: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Observaciones</label>
                                        <textarea
                                            value={formPago.observaciones}
                                            onChange={(e) => setFormPago({ ...formPago, observaciones: e.target.value })}
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    <div className="modal-actions">
                                        <button type="button" onClick={cerrarModal} className="btn-secondary">
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn-primary">
                                            Registrar Pago
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;