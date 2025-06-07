import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Cargar todas las secciones del dashboard
            await Promise.all([
                loadDashboardStats(),
                loadReservasRecientes(),
                loadResumenFinanciero(),
                loadEspaciosRanking()
            ]);

        } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
            setError('Error al cargar los datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const loadDashboardStats = async () => {
        try {
            const response = await fetch('http://localhost:3001/dashboard/stats');
            if (!response.ok) {
                throw new Error('Error al obtener estadísticas');
            }
            const data = await response.json();
            setStats({
                totalClientes: data.totalClientes || 0,
                totalReservas: data.totalReservas || 0,
                reservasHoy: data.reservasHoy || 0,
                ingresosMes: data.ingresosMes || 0
            });
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    const loadReservasRecientes = async () => {
        try {
            const response = await fetch('http://localhost:3001/dashboard/reservas-recientes');
            if (!response.ok) {
                throw new Error('Error al obtener reservas recientes');
            }
            const data = await response.json();
            setReservasRecientes(data);
        } catch (error) {
            console.error('Error al cargar reservas recientes:', error);
        }
    };

    const loadResumenFinanciero = async () => {
        try {
            const response = await fetch('http://localhost:3001/dashboard/resumen-financiero');
            if (!response.ok) {
                throw new Error('Error al obtener resumen financiero');
            }
            const data = await response.json();
            setResumenFinanciero({
                ingresosMes: data.ingresosMes || 0,
                pagosPendientes: data.pagosPendientes || 0,
                proyeccionMensual: data.proyeccionMensual || 0
            });
        } catch (error) {
            console.error('Error al cargar resumen financiero:', error);
        }
    };

    const loadEspaciosRanking = async () => {
        try {
            const response = await fetch('http://localhost:3001/dashboard/espacios-ranking');
            if (!response.ok) {
                throw new Error('Error al obtener ranking de espacios');
            }
            const data = await response.json();
            setEspaciosRanking(data);
        } catch (error) {
            console.error('Error al cargar ranking de espacios:', error);
        }
    };

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

    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
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
                        <h3>{formatMonto(stats.ingresosMes)}</h3>
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
                                                <div>
                                                    <strong>{reserva.cliente_nombre}</strong>
                                                    <small>{reserva.espacio_nombre} - {reserva.razon}</small>
                                                </div>
                                            </div>
                                            <small>{formatFecha(reserva.fecha_reserva)}</small>
                                        </div>
                                        <span className={`badge ${getEstadoBadge(reserva.estado)}`}>
                                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    <p>No hay reservas próximas</p>
                                </div>
                            )}
                        </div>
                        <div className="card-footer">
                            <button className="btn-view">Ver todas las reservas →</button>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h2>
                            <span className="section-icon">⚡</span>
                            Acciones Rápidas
                        </h2>
                        <div className="quick-actions">
                            <button className="action-btn primary">
                                <span>📅</span>
                                <div>
                                    <strong>Nueva Reserva</strong>
                                    <small>Crear una nueva reserva</small>
                                </div>
                            </button>
                            <button className="action-btn secondary">
                                <span>👤</span>
                                <div>
                                    <strong>Nuevo Cliente</strong>
                                    <small>Registrar cliente</small>
                                </div>
                            </button>
                            <button className="action-btn tertiary">
                                <span>💰</span>
                                <div>
                                    <strong>Registrar Pago</strong>
                                    <small>Procesar pago</small>
                                </div>
                            </button>
                            <button className="action-btn quaternary">
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
                                    {formatMonto(resumenFinanciero.ingresosMes)}
                                </span>
                            </div>
                            <div className="financial-item">
                                <span className="financial-label">Pagos pendientes</span>
                                <span className="financial-amount warning">
                                    {formatMonto(resumenFinanciero.pagosPendientes)}
                                </span>
                            </div>
                            <div className="financial-item">
                                <span className="financial-label">Proyección mensual</span>
                                <span className="financial-amount positive">
                                    {formatMonto(resumenFinanciero.proyeccionMensual)}
                                </span>
                            </div>
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
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${espacio.porcentaje || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    <p>No hay datos de espacios disponibles</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;