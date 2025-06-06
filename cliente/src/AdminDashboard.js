import React, { useState, useEffect } from 'react';
import Sidebar from '../src/Sidebar/Sidebar';
import './AdminDashboard.css';

function AdminDashboard() {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [stats, setStats] = useState({
        totalClientes: 0,
        totalReservas: 0,
        reservasHoy: 0,
        ingresosMes: 0
    });

    useEffect(() => {
        // Verificar si el admin está logueado
        const adminLoggedIn = localStorage.getItem('adminLoggedIn');
        if (!adminLoggedIn) {
            window.location.href = '/admin-login';
            return;
        }

        // Cargar estadísticas del dashboard
        loadDashboardStats();
    }, []);

    const loadDashboardStats = async () => {
        try {
            // Aquí irían las llamadas a la API para obtener estadísticas
            // Por ahora usamos datos simulados
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

    const renderDashboardContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="dashboard-overview">
                        <div className="dashboard-header">
                            <h1>Dashboard - Centro de Eventos</h1>
                            <p>Resumen general del sistema</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card clients">
                                <div className="stat-icon">👥</div>
                                <div className="stat-info">
                                    <h3>{stats.totalClientes}</h3>
                                    <p>Total Clientes</p>
                                </div>
                                <div className="stat-trend">+12%</div>
                            </div>

                            <div className="stat-card bookings">
                                <div className="stat-icon">📅</div>
                                <div className="stat-info">
                                    <h3>{stats.totalReservas}</h3>
                                    <p>Total Reservas</p>
                                </div>
                                <div className="stat-trend">+8%</div>
                            </div>

                            <div className="stat-card today">
                                <div className="stat-icon">⏰</div>
                                <div className="stat-info">
                                    <h3>{stats.reservasHoy}</h3>
                                    <p>Reservas Hoy</p>
                                </div>
                                <div className="stat-trend">+2</div>
                            </div>

                            <div className="stat-card revenue">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>${stats.ingresosMes.toLocaleString()}</h3>
                                    <p>Ingresos del Mes</p>
                                </div>
                                <div className="stat-trend">+15%</div>
                            </div>
                        </div>

                        <div className="dashboard-content">
                            <div className="recent-section">
                                <h2>Reservas Recientes</h2>
                                <div className="recent-bookings">
                                    <div className="booking-item">
                                        <div className="booking-info">
                                            <h4>María González</h4>
                                            <p>Sala Principal - Cumpleaños</p>
                                            <small>15 Junio 2025, 18:00</small>
                                        </div>
                                        <span className="booking-status confirmed">Confirmada</span>
                                    </div>
                                    <div className="booking-item">
                                        <div className="booking-info">
                                            <h4>Carlos Pérez</h4>
                                            <p>Salón VIP - Baby Shower</p>
                                            <small>20 Junio 2025, 16:00</small>
                                        </div>
                                        <span className="booking-status pending">Pendiente</span>
                                    </div>
                                    <div className="booking-item">
                                        <div className="booking-info">
                                            <h4>Ana López</h4>
                                            <p>Terraza - Reunión Familiar</p>
                                            <small>25 Junio 2025, 14:00</small>
                                        </div>
                                        <span className="booking-status confirmed">Confirmada</span>
                                    </div>
                                </div>
                            </div>

                            <div className="quick-actions">
                                <h2>Acciones Rápidas</h2>
                                <div className="action-buttons">
                                    <button
                                        className="action-btn primary"
                                        onClick={() => setActiveSection('reservas')}
                                    >
                                        📅 Nueva Reserva
                                    </button>
                                    <button
                                        className="action-btn secondary"
                                        onClick={() => setActiveSection('clientes')}
                                    >
                                        👤 Nuevo Cliente
                                    </button>
                                    <button
                                        className="action-btn tertiary"
                                        onClick={() => setActiveSection('pagos')}
                                    >
                                        💰 Registrar Pago
                                    </button>
                                    <button
                                        className="action-btn quaternary"
                                        onClick={() => setActiveSection('reportes')}
                                    >
                                        📊 Ver Reportes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'clientes':
                return (
                    <div className="section-content">
                        <h1>Gestión de Clientes</h1>
                        <p>Administra la información de tus clientes</p>
                        <div className="coming-soon">
                            <span>🚧</span>
                            <h3>Sección en desarrollo</h3>
                            <p>Esta funcionalidad estará disponible próximamente</p>
                        </div>
                    </div>
                );

            case 'espacios':
                return (
                    <div className="section-content">
                        <h1>Gestión de Espacios</h1>
                        <p>Administra los espacios disponibles para eventos</p>
                        <div className="coming-soon">
                            <span>🚧</span>
                            <h3>Sección en desarrollo</h3>
                            <p>Esta funcionalidad estará disponible próximamente</p>
                        </div>
                    </div>
                );

            case 'servicios':
                return (
                    <div className="section-content">
                        <h1>Servicios Adicionales</h1>
                        <p>Gestiona los servicios complementarios</p>
                        <div className="coming-soon">
                            <span>🚧</span>
                            <h3>Sección en desarrollo</h3>
                            <p>Esta funcionalidad estará disponible próximamente</p>
                        </div>
                    </div>
                );

            case 'reservas':
                return (
                    <div className="section-content">
                        <h1>Gestión de Reservas</h1>
                        <p>Administra todas las reservas del sistema</p>
                        <div className="coming-soon">
                            <span>🚧</span>
                            <h3>Sección en desarrollo</h3>
                            <p>Esta funcionalidad estará disponible próximamente</p>
                        </div>
                    </div>
                );

            case 'pagos':
                return (
                    <div className="section-content">
                        <h1>Control de Pagos</h1>
                        <p>Gestiona los pagos y abonos de las reservas</p>
                        <div className="coming-soon">
                            <span>🚧</span>
                            <h3>Sección en desarrollo</h3>
                            <p>Esta funcionalidad estará disponible próximamente</p>
                        </div>
                    </div>
                );

            case 'reportes':
                return (
                    <div className="section-content">
                        <h1>Reportes y Estadísticas</h1>
                        <p>Visualiza reportes detallados del negocio</p>
                        <div className="coming-soon">
                            <span>🚧</span>
                            <h3>Sección en desarrollo</h3>
                            <p>Esta funcionalidad estará disponible próximamente</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="section-content">
                        <h1>Sección no encontrada</h1>
                        <p>La sección solicitada no existe</p>
                    </div>
                );
        }
    };

    return (
        <div className="admin-dashboard">
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
            <div className="main-content">
                {renderDashboardContent()}
            </div>
        </div>
    );
}

export default AdminDashboard;