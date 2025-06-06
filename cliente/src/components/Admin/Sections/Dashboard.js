import React, { useState, useEffect } from 'react';
import './Sections.css';

function Dashboard() {
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalReservas: 0,
        reservasHoy: 0,
        ingresosMes: 0
    });

    useEffect(() => {
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setStats({
                totalClientes: 125,
                totalReservas: 87,
                reservasHoy: 5,
                ingresosMes: 2500000
            });
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

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
            </div>

            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <div>
                        <h3>{stats.totalClientes}</h3>
                        <p>Total Clientes</p>
                        <small className="stat-trend positive">+12%</small>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>{stats.totalReservas}</h3>
                        <p>Total Reservas</p>
                        <small className="stat-trend positive">+8%</small>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">⏰</span>
                    <div>
                        <h3>{stats.reservasHoy}</h3>
                        <p>Reservas Hoy</p>
                        <small className="stat-trend neutral">+2</small>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <div>
                        <h3>${stats.ingresosMes.toLocaleString()}</h3>
                        <p>Ingresos del Mes</p>
                        <small className="stat-trend positive">+15%</small>
                    </div>
                </div>
            </div>

            <div className="section-content">
                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h2>
                            <span className="section-icon">📋</span>
                            Reservas Recientes
                        </h2>
                        <div className="recent-bookings">
                            <div className="booking-item">
                                <div className="booking-info">
                                    <div className="client-info">
                                        <div className="client-avatar">MG</div>
                                        <div>
                                            <strong>María González</strong>
                                            <small>Sala Principal - Cumpleaños</small>
                                        </div>
                                    </div>
                                    <small>15 Junio 2025, 18:00</small>
                                </div>
                                <span className="badge badge-success">Confirmada</span>
                            </div>
                            <div className="booking-item">
                                <div className="booking-info">
                                    <div className="client-info">
                                        <div className="client-avatar">CP</div>
                                        <div>
                                            <strong>Carlos Pérez</strong>
                                            <small>Salón VIP - Baby Shower</small>
                                        </div>
                                    </div>
                                    <small>20 Junio 2025, 16:00</small>
                                </div>
                                <span className="badge badge-warning">Pendiente</span>
                            </div>
                            <div className="booking-item">
                                <div className="booking-info">
                                    <div className="client-info">
                                        <div className="client-avatar">AL</div>
                                        <div>
                                            <strong>Ana López</strong>
                                            <small>Terraza - Reunión Familiar</small>
                                        </div>
                                    </div>
                                    <small>25 Junio 2025, 14:00</small>
                                </div>
                                <span className="badge badge-success">Confirmada</span>
                            </div>
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
                                <span className="financial-amount positive">${stats.ingresosMes.toLocaleString()}</span>
                            </div>
                            <div className="financial-item">
                                <span className="financial-label">Pagos pendientes</span>
                                <span className="financial-amount warning">$850.000</span>
                            </div>
                            <div className="financial-item">
                                <span className="financial-label">Proyección mensual</span>
                                <span className="financial-amount positive">$3.200.000</span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h2>
                            <span className="section-icon">📊</span>
                            Espacios Más Utilizados
                        </h2>
                        <div className="spaces-ranking">
                            <div className="ranking-item">
                                <span className="ranking-number">1</span>
                                <div className="ranking-info">
                                    <strong>Salón Principal</strong>
                                    <small>15 reservas este mes</small>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '85%' }}></div>
                                </div>
                            </div>
                            <div className="ranking-item">
                                <span className="ranking-number">2</span>
                                <div className="ranking-info">
                                    <strong>Salón VIP</strong>
                                    <small>12 reservas este mes</small>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '70%' }}></div>
                                </div>
                            </div>
                            <div className="ranking-item">
                                <span className="ranking-number">3</span>
                                <div className="ranking-info">
                                    <strong>Terraza Jardín</strong>
                                    <small>8 reservas este mes</small>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;