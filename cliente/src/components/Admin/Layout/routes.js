import {
    FiBarChart2,
    FiUsers,
    FiHome,
    FiTarget,
    FiCalendar,
    FiDollarSign,
    FiTrendingUp
} from 'react-icons/fi';

export const adminRoutes = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: FiBarChart2,
        description: 'Vista general'
    },
    {
        id: 'clientes',
        label: 'Clientes',
        icon: FiUsers,
        description: 'Gestión de clientes'
    },
    {
        id: 'espacios',
        label: 'Espacios',
        icon: FiHome,
        description: 'Gestión de espacios'
    },
    {
        id: 'servicios',
        label: 'Servicios',
        icon: FiTarget,
        description: 'Servicios adicionales'
    },
    {
        id: 'reservas',
        label: 'Reservas',
        icon: FiCalendar,
        description: 'Gestión de reservas'
    },
    {
        id: 'pagos',
        label: 'Pagos',
        icon: FiDollarSign,
        description: 'Control de pagos'
    },
    {
        id: 'reportes',
        label: 'Reportes',
        icon: FiTrendingUp,
        description: 'Reportes y estadísticas'
    }
];

export default adminRoutes;