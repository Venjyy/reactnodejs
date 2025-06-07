import React, { useState } from 'react';
import Sidebar from '../components/Admin/Layout/Sidebar';
import Clientes from '../components/Admin/Sections/Clientes';
import Espacios from '../components/Admin/Sections/Espacios';
import Servicios from '../components/Admin/Sections/Servicios';
import Reservas from '../components/Admin/Sections/Reservas';
import Pagos from '../components/Admin/Sections/Pagos';
import Reportes from '../components/Admin/Sections/Reportes';
import './AdminPanel.css'
import Dashboard from '../components/Admin/Sections/Dashboard';
function AdminPanel() {
    const [activeSection, setActiveSection] = useState('dashboard');

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return <Dashboard />;
            case 'clientes':
                return <Clientes />;
            case 'espacios':
                return <Espacios />;
            case 'servicios':
                return <Servicios />;
            case 'reservas':
                return <Reservas />;
            case 'pagos':
                return <Pagos />;
            case 'reportes':
                return <Reportes />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="admin-layout">
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
            <main className="admin-main-content">
                {renderActiveSection()}
            </main>
        </div>
    );
}


export default AdminPanel;