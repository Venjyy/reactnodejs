import React from 'react';
import { adminRoutes } from './routes';
import './Sidebar.css';

function Sidebar({ activeSection, setActiveSection }) {
    const menuItems = adminRoutes;

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminId');
        window.location.href = '/admin-login';
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo-section">
                    <span className="logo-icon">🏛️</span>
                    <h2>Admin Panel</h2>
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-menu">
                    {menuItems.map((item) => (
                        <li key={item.id} className="nav-item">
                            <button
                                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                                title={item.description}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <div className="nav-text">
                                    <span className="nav-label">{item.label}</span>
                                    <small className="nav-description">{item.description}</small>
                                </div>
                                {activeSection === item.id && <span className="active-indicator"></span>}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">👤</div>
                    <div className="user-details">
                        <span className="user-name">
                            {localStorage.getItem('adminUser') || 'Admin'}
                        </span>
                        <small className="user-role">Administrador</small>
                    </div>
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