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
    connection.query('SELECT id, nombre, capacidad FROM espacio', (err, results) => {
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

// Endpoint para crear espacio (mantenido por compatibilidad)
app.post('/crearEspacio', (req, res) => {
    const { nombre, capacidad, costo_base, descripcion } = req.body;

    if (!nombre || !capacidad || !costo_base) {
        return res.status(400).json({ error: 'Nombre, capacidad y costo base son obligatorios' });
    }

    const query = 'INSERT INTO espacio (nombre, capacidad, costo_base, descripcion) VALUES (?, ?, ?, ?)';

    connection.query(query, [nombre, capacidad, costo_base, descripcion], (err, result) => {
        if (err) {
            console.error('Error al crear espacio:', err);
            return res.status(500).json({
                error: 'Error al crear el espacio',
                details: err.message
            });
        }

        res.status(201).json({
            message: 'Espacio creado correctamente',
            id: result.insertId
        });
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

// Rutas directas para compatibilidad con frontend existente
app.use('/', clientesRoutes);  // Para /clientes
app.use('/', reservasRoutes);  // Para /crearReserva

// Puerto del servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});