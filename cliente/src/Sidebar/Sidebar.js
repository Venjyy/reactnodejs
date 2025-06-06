import React, { useState } from 'react';
import './Sidebar.css';

function Sidebar({ activeSection, setActiveSection }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            description: 'Vista general'
        },
        {
            id: 'clientes',
            label: 'Clientes',
            icon: '👥',
            description: 'Gestión de clientes'
        },
        {
            id: 'espacios',
            label: 'Espacios',
            icon: '🏢',
            description: 'Gestión de espacios'
        },
        {
            id: 'servicios',
            label: 'Servicios',
            icon: '🎯',
            description: 'Servicios adicionales'
        },
        {
            id: 'reservas',
            label: 'Reservas',
            icon: '📅',
            description: 'Gestión de reservas'
        },
        {
            id: 'pagos',
            label: 'Pagos',
            icon: '💰',
            description: 'Control de pagos'
        },
        {
            id: 'reportes',
            label: 'Reportes',
            icon: '📈',
            description: 'Reportes y estadísticas'
        }
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminId');
        window.location.href = '/admin-login';
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-section">
                    <span className="logo-icon">🏛️</span>
                    {!isCollapsed && <h2>Admin Panel</h2>}
                </div>
                <button
                    className="collapse-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? 'Expandir' : 'Contraer'}
                >
                    {isCollapsed ? '➡️' : '⬅️'}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-menu">
                    {menuItems.map((item) => (
                        <li key={item.id} className="nav-item">
                            <button
                                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                                title={isCollapsed ? item.label : item.description}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {!isCollapsed && (
                                    <div className="nav-text">
                                        <span className="nav-label">{item.label}</span>
                                        <small className="nav-description">{item.description}</small>
                                    </div>
                                )}
                                {activeSection === item.id && <span className="active-indicator"></span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">👤</div>
                    {!isCollapsed && (
                        <div className="user-details">
                            <span className="user-name">
                                {localStorage.getItem('adminUser') || 'Admin'}
                            </span>
                            <small className="user-role">Administrador</small>
                        </div>
                    )}
                </div>

                <div className="footer-actions">
                    <button
                        className="settings-btn"
                        title="Configuración"
                    >
                        ⚙️
                    </button>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Cerrar sesión"
                    >
                        🚪
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;