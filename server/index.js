// Cargar variables de entorno
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Importar configuración de base de datos
const connection = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const clientesRoutes = require('./routes/clientes');
const espaciosRoutes = require('./routes/espacios');
const serviciosRoutes = require('./routes/servicios');
const reservasRoutes = require('./routes/reservas');
const pagosRoutes = require('./routes/pagos');
const reportesRoutes = require('./routes/reportes');
const climaRoutes = require('./routes/clima');
const khipuRoutes = require('./routes/khipu');
const khipuWebhookRoutes = require('./routes/khipu-webhook');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Endpoint de prueba
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date() });
});

// Endpoint para obtener espacios (mantenido por compatibilidad)
app.get('/espacios', (req, res) => {
    connection.query('SELECT id, nombre, capacidad, costo_base FROM espacio WHERE disponible = 1', (err, results) => {
        if (err) {
            console.error('Error al obtener espacios:', err);
            return res.status(500).json({
                error: 'Error al obtener los espacios disponibles',
                details: err.message
            });
        }
        res.status(200).json(results);
    });
});

// Endpoint para obtener disponibilidad de fechas por espacio
app.get('/api/disponibilidad/:espacioId', (req, res) => {
    const { espacioId } = req.params;

    console.log('Consultando disponibilidad para espacio:', espacioId);

    const query = `
        SELECT DATE(fecha_reserva) as fecha_ocupada 
        FROM reserva 
        WHERE espacio_id = ? 
        AND estado != 'cancelada'
        AND fecha_reserva >= CURDATE()
    `;

    connection.query(query, [espacioId], (err, result) => {
        if (err) {
            console.error('Error al obtener disponibilidad:', err);
            return res.status(500).json({
                error: 'Error al consultar disponibilidad',
                details: err.message
            });
        } else {
            // Convertir las fechas a formato ISO string para mejor compatibilidad
            const fechasOcupadas = result.map(row => {
                // Asegurar que la fecha esté en formato 'YYYY-MM-DD'
                const fecha = new Date(row.fecha_ocupada);
                return fecha.toISOString().split('T')[0];
            });

            console.log('Fechas ocupadas encontradas:', fechasOcupadas);
            res.json({ fechasOcupadas });
        }
    });
});

// Endpoint para obtener servicios ocupados en una fecha específica
app.get('/api/servicios-ocupados/:fecha', (req, res) => {
    const { fecha } = req.params;

    const query = `
        SELECT DISTINCT rs.servicio_id
        FROM reserva r
        JOIN reserva_servicio rs ON r.id = rs.reserva_id
        WHERE DATE(r.fecha_reserva) = ?
        AND r.estado != 'cancelada'
    `;

    connection.query(query, [fecha], (err, result) => {
        if (err) {
            console.error('Error al obtener servicios ocupados:', err);
            return res.status(500).json({
                error: 'Error al consultar servicios ocupados',
                details: err.message
            });
        } else {
            const serviciosOcupados = result.map(row => row.servicio_id);
            res.json({ serviciosOcupados });
        }
    });
});

// Usar las rutas - ORDEN IMPORTANTE para evitar conflictos
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);

// Rutas específicas de la API
app.use('/api', clientesRoutes);
app.use('/api', espaciosRoutes);
app.use('/api', serviciosRoutes);
app.use('/api', reservasRoutes);
app.use('/api', pagosRoutes);
app.use('/api', reportesRoutes);
app.use('/api/clima', climaRoutes);
app.use('/api/khipu', khipuRoutes);
app.use('/api/khipu', khipuWebhookRoutes);

// Rutas directas para compatibilidad con frontend existente
app.use('/', clientesRoutes);  // Para /clientes
app.use('/', reservasRoutes);  // Para /crearReserva

// Puerto del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`API de clima configurada: ${!!process.env.OPENWEATHER_API_KEY}`);
});