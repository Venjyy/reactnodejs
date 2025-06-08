const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Crear conexión MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ben1012',
    database: 'centroevento'
});

// Conectar a MySQL
connection.connect(err => {
    if (err) {
        console.error('Error al conectar a MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});
// Endpoint de prueba
app.get('/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente', timestamp: new Date() });
});

// Endpoint para crear administradores
app.post('/creaAdmin', (req, res) => {
    const { usuario, pass } = req.body;

    if (!usuario || !pass) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Verificar si el admin ya existe
    connection.query('SELECT * FROM admin WHERE usuario = ?', [usuario], (err, results) => {
        if (err) {
            console.error('Error al verificar admin:', err);
            return res.status(500).json({ error: 'Error al verificar administrador' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'El administrador ya existe' });
        }

        // Si no existe, insertar el nuevo admin
        const query = 'INSERT INTO admin (usuario, pass) VALUES (?, ?)';

        connection.query(query, [usuario, pass], (err, result) => {
            if (err) {
                console.error('Error al registrar admin:', err);
                return res.status(500).json({ error: 'Error al registrar administrador' });
            }

            res.status(201).json({
                message: 'Administrador registrado correctamente',
                id: result.insertId
            });
        });
    });
});
// Endpoint para login de administradores
app.post('/loginAdmin', (req, res) => {
    console.log('Endpoint /loginAdmin llamado');
    console.log('Datos recibidos:', req.body);

    const { usuario, pass } = req.body;

    if (!usuario || !pass) {
        console.log('Datos faltantes para login');
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar admin en la base de datos
    const query = 'SELECT * FROM admin WHERE usuario = ? AND pass = ?';

    connection.query(query, [usuario, pass], (err, results) => {
        if (err) {
            console.error('Error al verificar credenciales:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        console.log('Resultados de login:', results);

        if (results.length === 0) {
            console.log('Credenciales incorrectas');
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        console.log('Login exitoso para usuario:', usuario);
        res.status(200).json({
            message: 'Login exitoso',
            usuario: results[0].usuario,
            id: results[0].id
        });
    });
});

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
// ===== ENDPOINTS PARA DASHBOARD =====

// Endpoint para obtener estadísticas del dashboard
app.get('/dashboard/stats', (req, res) => {
    console.log('Endpoint /dashboard/stats llamado');

    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM cliente) as totalClientes,
            (SELECT COUNT(*) FROM reserva) as totalReservas,
            (SELECT COUNT(*) FROM reserva WHERE DATE(fecha_reserva) = CURDATE()) as reservasHoy,
            (SELECT COALESCE(SUM(p.abono), 0) FROM pago p 
             WHERE MONTH(p.fecha_pago) = MONTH(CURDATE()) 
             AND YEAR(p.fecha_pago) = YEAR(CURDATE())) as ingresosMes
    `;

    connection.query(statsQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta de estadísticas:', err);
            res.status(500).json({
                error: 'Error al obtener estadísticas',
                details: err.message
            });
            return;
        }

        const stats = results[0] || {
            totalClientes: 0,
            totalReservas: 0,
            reservasHoy: 0,
            ingresosMes: 0
        };

        console.log('Estadísticas obtenidas:', stats);
        res.json(stats);
    });
});

// Endpoint para obtener reservas recientes
app.get('/dashboard/reservas-recientes', (req, res) => {
    console.log('Endpoint /dashboard/reservas-recientes llamado');

    const reservasQuery = `
        SELECT 
            r.id,
            r.fecha_reserva,
            r.estado,
            r.razon,
            c.nombre as cliente_nombre,
            e.nombre as espacio_nombre
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        WHERE r.fecha_reserva >= NOW()
        ORDER BY r.fecha_reserva ASC
        LIMIT 5
    `;

    connection.query(reservasQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta de reservas recientes:', err);
            res.status(500).json({
                error: 'Error al obtener reservas recientes',
                details: err.message
            });
            return;
        }

        console.log('Reservas recientes obtenidas:', results.length);
        res.json(results);
    });
});

// Endpoint para obtener resumen financiero
app.get('/dashboard/resumen-financiero', (req, res) => {
    console.log('Endpoint /dashboard/resumen-financiero llamado');

    const financieroQuery = `
        SELECT 
            (SELECT COALESCE(SUM(p.abono), 0) FROM pago p 
             WHERE MONTH(p.fecha_pago) = MONTH(CURDATE()) 
             AND YEAR(p.fecha_pago) = YEAR(CURDATE())) as ingresosMes,
            (SELECT COALESCE(SUM(
                (e.costo_base + COALESCE(servicios_total.costo_servicios, 0)) - COALESCE(pagos_total.total_pagado, 0)
            ), 0) FROM reserva r
             JOIN espacio e ON r.espacio_id = e.id
             LEFT JOIN (
                 SELECT rs.reserva_id, SUM(s.costo) as costo_servicios
                 FROM reserva_servicio rs
                 JOIN servicio s ON rs.servicio_id = s.id
                 GROUP BY rs.reserva_id
             ) servicios_total ON r.id = servicios_total.reserva_id
             LEFT JOIN (
                 SELECT reserva_id, SUM(abono) as total_pagado
                 FROM pago
                 GROUP BY reserva_id
             ) pagos_total ON r.id = pagos_total.reserva_id
             WHERE r.estado IN ('confirmada', 'pendiente')
             AND ((e.costo_base + COALESCE(servicios_total.costo_servicios, 0)) - COALESCE(pagos_total.total_pagado, 0)) > 0) as pagosPendientes,
            (SELECT COALESCE(
                (SUM(p.abono) / NULLIF(COUNT(DISTINCT MONTH(p.fecha_pago)), 0)) * 12, 0
            ) FROM pago p 
             WHERE YEAR(p.fecha_pago) = YEAR(CURDATE())) as proyeccionMensual
    `;

    connection.query(financieroQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta financiera:', err);
            res.status(500).json({
                error: 'Error al obtener datos financieros',
                details: err.message
            });
            return;
        }

        const data = results[0] || {
            ingresosMes: 0,
            pagosPendientes: 0,
            proyeccionMensual: 0
        };

        console.log('Datos financieros obtenidos:', data);
        res.json(data);
    });
});

// Endpoint para obtener espacios más utilizados
app.get('/dashboard/espacios-ranking', (req, res) => {
    console.log('Endpoint /dashboard/espacios-ranking llamado');

    const rankingQuery = `
        SELECT 
            e.nombre,
            COUNT(r.id) as total_reservas,
            CASE 
                WHEN (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE())) > 0
                THEN ROUND((COUNT(r.id) * 100.0 / (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE()))), 1)
                ELSE 0
            END as porcentaje
        FROM espacio e
        LEFT JOIN reserva r ON e.id = r.espacio_id 
            AND MONTH(r.fecha_reserva) = MONTH(CURDATE()) 
            AND YEAR(r.fecha_reserva) = YEAR(CURDATE())
        GROUP BY e.id, e.nombre
        ORDER BY total_reservas DESC, e.nombre ASC
        LIMIT 5
    `;

    connection.query(rankingQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta de ranking:', err);
            res.status(500).json({
                error: 'Error al obtener ranking de espacios',
                details: err.message
            });
            return;
        }

        console.log('Ranking de espacios obtenido:', results);
        res.json(results);
    });
});
// Endpoint para obtener resumen financiero
app.get('/dashboard/resumen-financiero', (req, res) => {
    console.log('Endpoint /dashboard/resumen-financiero llamado');

    const financieroQuery = `
        SELECT 
            (SELECT COALESCE(SUM(p.abono), 0) FROM pago p 
             WHERE MONTH(p.fecha_pago) = MONTH(CURDATE()) 
             AND YEAR(p.fecha_pago) = YEAR(CURDATE())) as ingresosMes,
            (SELECT COALESCE(SUM(
                (e.costo_base + COALESCE(servicios_total.costo_servicios, 0)) - COALESCE(pagos_total.total_pagado, 0)
            ), 0) FROM reserva r
             JOIN espacio e ON r.espacio_id = e.id
             LEFT JOIN (
                 SELECT rs.reserva_id, SUM(s.costo) as costo_servicios
                 FROM reserva_servicio rs
                 JOIN servicio s ON rs.servicio_id = s.id
                 GROUP BY rs.reserva_id
             ) servicios_total ON r.id = servicios_total.reserva_id
             LEFT JOIN (
                 SELECT reserva_id, SUM(abono) as total_pagado
                 FROM pago
                 GROUP BY reserva_id
             ) pagos_total ON r.id = pagos_total.reserva_id
             WHERE r.estado IN ('confirmada', 'pendiente')
             AND ((e.costo_base + COALESCE(servicios_total.costo_servicios, 0)) - COALESCE(pagos_total.total_pagado, 0)) > 0) as pagosPendientes,
            (SELECT COALESCE(
                (SUM(p.abono) / NULLIF(COUNT(DISTINCT MONTH(p.fecha_pago)), 0)) * 12, 0
            ) FROM pago p 
             WHERE YEAR(p.fecha_pago) = YEAR(CURDATE())) as proyeccionMensual
    `;

    connection.query(financieroQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta financiera:', err);
            res.status(500).json({
                error: 'Error al obtener datos financieros',
                details: err.message
            });
            return;
        }

        const data = results[0] || {
            ingresosMes: 0,
            pagosPendientes: 0,
            proyeccionMensual: 0
        };

        console.log('Datos financieros obtenidos:', data);
        res.json(data);
    });
});

// Endpoint para obtener espacios más utilizados
app.get('/dashboard/espacios-ranking', (req, res) => {
    console.log('Endpoint /dashboard/espacios-ranking llamado');

    const rankingQuery = `
        SELECT 
            e.nombre,
            COUNT(r.id) as total_reservas,
            CASE 
                WHEN (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE())) > 0
                THEN ROUND((COUNT(r.id) * 100.0 / (SELECT COUNT(*) FROM reserva WHERE MONTH(fecha_reserva) = MONTH(CURDATE()) AND YEAR(fecha_reserva) = YEAR(CURDATE()))), 1)
                ELSE 0
            END as porcentaje
        FROM espacio e
        LEFT JOIN reserva r ON e.id = r.espacio_id 
            AND MONTH(r.fecha_reserva) = MONTH(CURDATE()) 
            AND YEAR(r.fecha_reserva) = YEAR(CURDATE())
        GROUP BY e.id, e.nombre
        ORDER BY total_reservas DESC, e.nombre ASC
        LIMIT 5
    `;

    connection.query(rankingQuery, (err, results) => {
        if (err) {
            console.error('Error en consulta de ranking:', err);
            res.status(500).json({
                error: 'Error al obtener ranking de espacios',
                details: err.message
            });
            return;
        }

        console.log('Ranking de espacios obtenido:', results);
        res.json(results);
    });
});
// Endpoint específico para obtener clientes (usado por el dashboard)
app.get('/api/clientes', (req, res) => {
    console.log('Endpoint /api/clientes llamado desde dashboard');

    const query = `
        SELECT 
            id,
            nombre,
            rut,
            correo,
            telefono,
            fecha_creacion
        FROM cliente
        ORDER BY nombre
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener clientes para dashboard:', err);
            return res.status(500).json({ error: 'Error al obtener clientes' });
        }

        console.log('Clientes para dashboard obtenidos:', results.length);
        res.status(200).json(results);
    });
});

// Endpoint para crear cliente desde dashboard
app.post('/api/clientes', (req, res) => {
    console.log('Endpoint POST /api/clientes llamado desde dashboard');
    console.log('Datos recibidos:', req.body);

    const { nombre, rut, correo, telefono } = req.body;

    if (!nombre || !rut) {
        return res.status(400).json({
            message: 'Nombre y RUT son requeridos'
        });
    }

    // Verificar si el cliente ya existe por RUT
    const checkQuery = 'SELECT id FROM cliente WHERE rut = ?';

    connection.query(checkQuery, [rut], (err, results) => {
        if (err) {
            console.error('Error al verificar cliente:', err);
            return res.status(500).json({
                message: 'Error al verificar cliente'
            });
        }

        if (results.length > 0) {
            return res.status(409).json({
                message: 'Ya existe un cliente con ese RUT'
            });
        }

        // Insertar nuevo cliente
        const insertQuery = 'INSERT INTO cliente (nombre, rut, correo, telefono) VALUES (?, ?, ?, ?)';

        connection.query(insertQuery, [nombre, rut, correo || '', telefono || ''], (err, result) => {
            if (err) {
                console.error('Error al crear cliente:', err);
                return res.status(500).json({
                    message: 'Error al crear cliente'
                });
            }

            console.log('Cliente creado desde dashboard con ID:', result.insertId);
            res.status(201).json({
                message: 'Cliente creado correctamente',
                id: result.insertId,
                cliente: {
                    id: result.insertId,
                    nombre,
                    rut,
                    correo: correo || '',
                    telefono: telefono || ''
                }
            });
        });
    });
});

// Endpoint específico para crear reserva desde dashboard
app.post('/crearReserva', (req, res) => {
    console.log('Endpoint POST /crearReserva llamado desde dashboard');
    console.log('Datos recibidos:', req.body);

    const { clienteId, espacioId, fecha, horario, personas, razon, servicios } = req.body;

    if (!clienteId || !espacioId || !fecha || !horario || !personas || !razon) {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios: clienteId, espacioId, fecha, horario, personas, razon'
        });
    }

    // Verificar que el cliente existe
    connection.query('SELECT id, nombre FROM cliente WHERE id = ?', [clienteId], (err, clienteResults) => {
        if (err) {
            console.error('Error verificando cliente:', err);
            return res.status(500).json({
                error: 'Error al verificar cliente'
            });
        }

        if (clienteResults.length === 0) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        // Verificar que el espacio existe y está disponible
        connection.query('SELECT id, nombre, disponible FROM espacio WHERE id = ?', [espacioId], (err, espacioResults) => {
            if (err) {
                console.error('Error verificando espacio:', err);
                return res.status(500).json({
                    error: 'Error al verificar espacio'
                });
            }

            if (espacioResults.length === 0) {
                return res.status(404).json({
                    error: 'Espacio no encontrado'
                });
            }

            if (!espacioResults[0].disponible) {
                return res.status(400).json({
                    error: 'El espacio seleccionado no está disponible'
                });
            }

            // Verificar disponibilidad en la fecha seleccionada
            const fechaReserva = `${fecha} ${horario}:00`;
            const checkDisponibilidadQuery = `
                SELECT id FROM reserva 
                WHERE espacio_id = ? 
                AND DATE(fecha_reserva) = ? 
                AND estado IN ('pendiente', 'confirmada')
            `;

            connection.query(checkDisponibilidadQuery, [espacioId, fecha], (err, conflictos) => {
                if (err) {
                    console.error('Error verificando disponibilidad:', err);
                    return res.status(500).json({
                        error: 'Error al verificar disponibilidad'
                    });
                }

                if (conflictos.length > 0) {
                    return res.status(409).json({
                        error: 'El espacio ya está reservado para esa fecha'
                    });
                }

                // Crear la reserva
                const reservaQuery = `
                    INSERT INTO reserva (fecha_reserva, estado, cantidad_personas, razon, cliente_id, espacio_id) 
                    VALUES (?, 'pendiente', ?, ?, ?, ?)
                `;

                connection.query(reservaQuery, [fechaReserva, personas, razon, clienteId, espacioId], (err, reservaResult) => {
                    if (err) {
                        console.error('Error creando reserva:', err);
                        return res.status(500).json({
                            error: 'Error al crear la reserva'
                        });
                    }

                    const reservaId = reservaResult.insertId;
                    console.log('Reserva creada desde dashboard con ID:', reservaId);

                    // Agregar servicios si se seleccionaron
                    if (servicios && servicios.length > 0) {
                        const serviciosValues = servicios.map(servicioId => [reservaId, servicioId]);
                        const insertServiciosQuery = 'INSERT INTO reserva_servicio (reserva_id, servicio_id) VALUES ?';

                        connection.query(insertServiciosQuery, [serviciosValues], (err) => {
                            if (err) {
                                console.error('Error agregando servicios:', err);
                                // La reserva ya se creó, solo falló agregar servicios
                                return res.status(201).json({
                                    message: 'Reserva creada correctamente, pero algunos servicios no pudieron agregarse',
                                    reservaId: reservaId,
                                    warning: 'Algunos servicios no se agregaron'
                                });
                            }

                            console.log(`${servicios.length} servicios agregados a la reserva ${reservaId}`);
                            res.status(201).json({
                                message: 'Reserva creada correctamente con servicios',
                                reservaId: reservaId,
                                clienteNombre: clienteResults[0].nombre,
                                espacioNombre: espacioResults[0].nombre,
                                serviciosAgregados: servicios.length
                            });
                        });
                    } else {
                        // Sin servicios
                        res.status(201).json({
                            message: 'Reserva creada correctamente',
                            reservaId: reservaId,
                            clienteNombre: clienteResults[0].nombre,
                            espacioNombre: espacioResults[0].nombre
                        });
                    }
                });
            });
        });
    });
});

// Endpoint específico para obtener reservas para pagos (dashboard)
app.get('/api/reservas', (req, res) => {
    console.log('Endpoint /api/reservas llamado');

    const query = `
        SELECT 
            r.id,
            r.fecha_reserva,
            r.estado,
            r.cantidad_personas,
            r.razon,
            r.fecha_creacion,
            c.id as cliente_id,
            c.nombre as cliente_nombre,
            c.rut as cliente_rut,
            e.id as espacio_id,
            e.nombre as espacio_nombre,
            e.costo_base as espacio_costo,
            GROUP_CONCAT(DISTINCT s.id) as servicios_ids,
            GROUP_CONCAT(DISTINCT s.nombre) as servicios_nombres,
            GROUP_CONCAT(DISTINCT s.costo) as servicios_costos,
            COALESCE(SUM(DISTINCT s.costo), 0) as total_servicios,
            COALESCE(pagos.total_pagado, 0) as total_pagado
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        LEFT JOIN reserva_servicio rs ON r.id = rs.reserva_id
        LEFT JOIN servicio s ON rs.servicio_id = s.id
        LEFT JOIN (
            SELECT reserva_id, SUM(abono) as total_pagado
            FROM pago
            GROUP BY reserva_id
        ) pagos ON r.id = pagos.reserva_id
        GROUP BY r.id, r.fecha_reserva, r.estado, r.cantidad_personas, r.razon, r.fecha_creacion,
                 c.id, c.nombre, c.rut, e.id, e.nombre, e.costo_base, pagos.total_pagado
        ORDER BY r.fecha_reserva DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener reservas:', err);
            return res.status(500).json({ error: 'Error al obtener reservas' });
        }

        console.log('Resultados brutos de la consulta:', results);

        // Transformar los datos para el formato esperado por el frontend
        const reservasFormatted = results.map(reserva => {
            console.log('Procesando reserva:', reserva.id);

            const fechaReserva = new Date(reserva.fecha_reserva);
            const costoEspacio = parseFloat(reserva.espacio_costo) || 0;
            const costoServicios = parseFloat(reserva.total_servicios) || 0;
            const costoTotal = costoEspacio + costoServicios;
            const totalPagado = parseFloat(reserva.total_pagado) || 0;
            const saldoPendiente = costoTotal - totalPagado;

            // Procesar servicios
            let serviciosSeleccionados = [];
            let serviciosNombres = [];

            if (reserva.servicios_ids && reserva.servicios_ids !== '') {
                serviciosSeleccionados = reserva.servicios_ids.split(',').map(id => parseInt(id));
                serviciosNombres = reserva.servicios_nombres ? reserva.servicios_nombres.split(',') : [];
            }

            const reservaFormateada = {
                id: reserva.id,
                clienteId: reserva.cliente_id,
                clienteNombre: reserva.cliente_nombre || 'Sin nombre',
                espacioId: reserva.espacio_id,
                espacioNombre: reserva.espacio_nombre || 'Sin espacio',
                fechaEvento: fechaReserva.toISOString().split('T')[0],
                horaInicio: fechaReserva.toTimeString().substring(0, 5),
                horaFin: new Date(fechaReserva.getTime() + 4 * 60 * 60 * 1000).toTimeString().substring(0, 5),
                tipoEvento: reserva.razon || 'Sin especificar',
                numeroPersonas: reserva.cantidad_personas || 0,
                serviciosSeleccionados: serviciosSeleccionados,
                serviciosNombres: serviciosNombres,
                estado: reserva.estado || 'pendiente',
                fechaCreacion: reserva.fecha_creacion ? reserva.fecha_creacion.toISOString().split('T')[0] : '',
                observaciones: `Cliente: ${reserva.cliente_nombre} (${reserva.cliente_rut})`,
                costoEspacio: costoEspacio,
                costoServicios: costoServicios,
                descuento: 0,
                costoTotal: costoTotal,
                anticipo: totalPagado,
                saldoPendiente: Math.max(0, saldoPendiente)
            };

            console.log('Reserva formateada:', reservaFormateada);
            return reservaFormateada;
        });

        console.log('Reservas obtenidas y formateadas:', reservasFormatted.length);
        console.log('Primera reserva como ejemplo:', reservasFormatted[0]);
        res.status(200).json(reservasFormatted);
    });
});

// Endpoint específico para crear pago desde dashboard
app.post('/api/pagos', (req, res) => {
    console.log('Endpoint POST /api/pagos llamado desde dashboard');
    console.log('Datos recibidos:', req.body);

    const { reservaId, monto, metodoPago, fechaPago, observaciones } = req.body;

    if (!reservaId || !monto || !fechaPago) {
        return res.status(400).json({
            message: 'Los campos reservaId, monto y fechaPago son obligatorios'
        });
    }

    // Verificar que la reserva existe y obtener información del costo
    const checkReservaQuery = `
        SELECT 
            r.id,
            r.estado,
            c.nombre as cliente_nombre,
            e.nombre as espacio_nombre,
            e.costo_base,
            COALESCE(SUM(s.costo), 0) as costo_servicios,
            COALESCE(pagos.total_pagado, 0) as total_pagado
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        LEFT JOIN reserva_servicio rs ON r.id = rs.reserva_id
        LEFT JOIN servicio s ON rs.servicio_id = s.id
        LEFT JOIN (
            SELECT reserva_id, SUM(abono) as total_pagado
            FROM pago
            GROUP BY reserva_id
        ) pagos ON r.id = pagos.reserva_id
        WHERE r.id = ?
        GROUP BY r.id, r.estado, c.nombre, e.nombre, e.costo_base, pagos.total_pagado
    `;

    connection.query(checkReservaQuery, [reservaId], (err, reservaResults) => {
        if (err) {
            console.error('Error verificando reserva para pago:', err);
            return res.status(500).json({
                message: 'Error al verificar reserva'
            });
        }

        if (reservaResults.length === 0) {
            return res.status(404).json({
                message: 'Reserva no encontrada'
            });
        }

        const reserva = reservaResults[0];
        const costoTotal = parseFloat(reserva.costo_base) + parseFloat(reserva.costo_servicios);
        const totalPagado = parseFloat(reserva.total_pagado);
        const saldoPendiente = costoTotal - totalPagado;

        // Validar que el monto no exceda el saldo pendiente
        if (parseFloat(monto) > saldoPendiente) {
            return res.status(400).json({
                message: `El monto no puede exceder el saldo pendiente ($${saldoPendiente.toLocaleString()})`
            });
        }

        // Crear el pago
        const insertPagoQuery = `
            INSERT INTO pago (monto_total, abono, fecha_pago, reserva_id) 
            VALUES (?, ?, ?, ?)
        `;

        connection.query(insertPagoQuery, [costoTotal, monto, fechaPago, reservaId], (err, result) => {
            if (err) {
                console.error('Error creando pago:', err);
                return res.status(500).json({
                    message: 'Error al registrar pago'
                });
            }

            const pagoId = result.insertId;
            const nuevoTotalPagado = totalPagado + parseFloat(monto);
            const nuevoSaldoPendiente = costoTotal - nuevoTotalPagado;

            console.log('Pago creado desde dashboard con ID:', pagoId);

            // Si el pago completa la reserva, actualizar estado
            if (nuevoSaldoPendiente <= 0) {
                connection.query(
                    'UPDATE reserva SET estado = "confirmada" WHERE id = ? AND estado = "pendiente"',
                    [reservaId],
                    (err) => {
                        if (err) {
                            console.error('Error actualizando estado de reserva:', err);
                        } else {
                            console.log('Reserva marcada como confirmada por pago completo');
                        }
                    }
                );
            }

            res.status(201).json({
                message: 'Pago registrado correctamente',
                pagoId: pagoId,
                reservaId: reservaId,
                clienteNombre: reserva.cliente_nombre,
                espacioNombre: reserva.espacio_nombre,
                montoPagado: parseFloat(monto),
                nuevoSaldoPendiente: Math.max(0, nuevoSaldoPendiente),
                estadoReserva: nuevoSaldoPendiente <= 0 ? 'confirmada' : reserva.estado
            });
        });
    });
});
// ===== ENDPOINTS PARA CLIENTES =====

// Endpoint para obtener todos los clientes
app.get('/clientes', (req, res) => {
    console.log('Endpoint /clientes llamado');

    const query = `
        SELECT 
            c.id,
            c.nombre,
            c.rut,
            c.correo,
            c.telefono,
            c.fecha_creacion,
            COUNT(r.id) as total_reservas,
            MAX(r.fecha_reserva) as ultima_reserva
        FROM cliente c
        LEFT JOIN reserva r ON c.id = r.cliente_id
        GROUP BY c.id, c.nombre, c.rut, c.correo, c.telefono, c.fecha_creacion
        ORDER BY c.fecha_creacion DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener clientes:', err);
            return res.status(500).json({ error: 'Error al obtener clientes' });
        }

        console.log('Clientes obtenidos:', results.length);
        res.status(200).json(results);
    });
});

// Endpoint para crear un nuevo cliente
app.post('/clientes', (req, res) => {
    console.log('Endpoint POST /clientes llamado');
    console.log('Datos recibidos:', req.body);

    const { nombre, rut, correo, telefono } = req.body;

    if (!nombre || !rut) {
        return res.status(400).json({ error: 'Nombre y RUT son requeridos' });
    }

    // Verificar si el cliente ya existe por RUT
    const checkQuery = 'SELECT id FROM cliente WHERE rut = ?';

    connection.query(checkQuery, [rut], (err, results) => {
        if (err) {
            console.error('Error al verificar cliente:', err);
            return res.status(500).json({ error: 'Error al verificar cliente' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'Ya existe un cliente con ese RUT' });
        }

        // Insertar nuevo cliente
        const insertQuery = 'INSERT INTO cliente (nombre, rut, correo, telefono) VALUES (?, ?, ?, ?)';

        connection.query(insertQuery, [nombre, rut, correo, telefono], (err, result) => {
            if (err) {
                console.error('Error al crear cliente:', err);
                return res.status(500).json({ error: 'Error al crear cliente' });
            }

            console.log('Cliente creado con ID:', result.insertId);
            res.status(201).json({
                message: 'Cliente creado correctamente',
                id: result.insertId
            });
        });
    });
});

// Endpoint para actualizar un cliente
app.put('/clientes/:id', (req, res) => {
    console.log('Endpoint PUT /clientes llamado');

    const { id } = req.params;
    const { nombre, rut, correo, telefono } = req.body;

    if (!nombre || !rut) {
        return res.status(400).json({ error: 'Nombre y RUT son requeridos' });
    }

    // Verificar si existe otro cliente con el mismo RUT (excluyendo el actual)
    const checkQuery = 'SELECT id FROM cliente WHERE rut = ? AND id != ?';

    connection.query(checkQuery, [rut, id], (err, results) => {
        if (err) {
            console.error('Error al verificar cliente:', err);
            return res.status(500).json({ error: 'Error al verificar cliente' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'Ya existe otro cliente con ese RUT' });
        }

        // Actualizar cliente
        const updateQuery = 'UPDATE cliente SET nombre = ?, rut = ?, correo = ?, telefono = ? WHERE id = ?';

        connection.query(updateQuery, [nombre, rut, correo, telefono, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar cliente:', err);
                return res.status(500).json({ error: 'Error al actualizar cliente' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            console.log('Cliente actualizado:', id);
            res.status(200).json({ message: 'Cliente actualizado correctamente' });
        });
    });
});

// Endpoint para eliminar un cliente
app.delete('/clientes/:id', (req, res) => {
    console.log('Endpoint DELETE /clientes llamado');

    const { id } = req.params;

    // Verificar si el cliente tiene reservas
    const checkReservasQuery = 'SELECT COUNT(*) as count FROM reserva WHERE cliente_id = ?';

    connection.query(checkReservasQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar reservas:', err);
            return res.status(500).json({ error: 'Error al verificar reservas' });
        }

        if (results[0].count > 0) {
            return res.status(409).json({
                error: 'No se puede eliminar el cliente porque tiene reservas asociadas'
            });
        }

        // Eliminar cliente
        const deleteQuery = 'DELETE FROM cliente WHERE id = ?';

        connection.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar cliente:', err);
                return res.status(500).json({ error: 'Error al eliminar cliente' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }

            console.log('Cliente eliminado:', id);
            res.status(200).json({ message: 'Cliente eliminado correctamente' });
        });
    });
});

// Endpoint para obtener un cliente específico
app.get('/clientes/:id', (req, res) => {
    console.log('Endpoint GET /clientes/:id llamado');

    const { id } = req.params;

    const query = `
        SELECT 
            c.id,
            c.nombre,
            c.rut,
            c.correo,
            c.telefono,
            c.fecha_creacion,
            COUNT(r.id) as total_reservas,
            MAX(r.fecha_reserva) as ultima_reserva
        FROM cliente c
        LEFT JOIN reserva r ON c.id = r.cliente_id
        WHERE c.id = ?
        GROUP BY c.id, c.nombre, c.rut, c.correo, c.telefono, c.fecha_creacion
    `;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener cliente:', err);
            return res.status(500).json({ error: 'Error al obtener cliente' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        res.status(200).json(results[0]);
    });
});
// ===== ENDPOINTS PARA ESPACIOS =====


// Endpoint para obtener todos los espacios
app.get('/api/espacios', (req, res) => {
    console.log('Endpoint /api/espacios llamado');

    const query = `
        SELECT 
            e.id,
            e.nombre,
            e.capacidad as capacidadMaxima,
            e.costo_base as costoBase,
            e.descripcion,
            e.disponible,
            e.fecha_creacion,
            COUNT(r.id) as reservasActuales
        FROM espacio e
        LEFT JOIN reserva r ON e.id = r.espacio_id 
            AND r.estado IN ('pendiente', 'confirmada')
            AND r.fecha_reserva >= NOW()
        GROUP BY e.id, e.nombre, e.capacidad, e.costo_base, e.descripcion, e.disponible, e.fecha_creacion
        ORDER BY e.nombre
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener espacios:', err);
            return res.status(500).json({ error: 'Error al obtener espacios' });
        }

        // Mapear los datos para incluir campos adicionales que maneja el frontend
        const espaciosConDatosCompletos = results.map(espacio => ({
            id: espacio.id,
            nombre: espacio.nombre,
            descripcion: espacio.descripcion || '',
            capacidadMaxima: espacio.capacidadMaxima,
            costoBase: parseFloat(espacio.costoBase),
            ubicacion: 'No especificada', // Campo no existe en BD, valor por defecto
            disponible: !!espacio.disponible, // CAMBIO: Usar valor real de la BD
            equipamiento: 'No especificado', // Campo no existe en BD, valor por defecto
            caracteristicas: 'No especificadas', // Campo no existe en BD, valor por defecto
            tipoEspacio: 'Otro', // Campo no existe en BD, valor por defecto
            dimensiones: 'No especificadas', // Campo no existe en BD, valor por defecto
            observaciones: '', // Campo no existe en BD, valor por defecto
            reservasActuales: espacio.reservasActuales || 0
        }));

        console.log('Espacios obtenidos:', espaciosConDatosCompletos.length);
        res.status(200).json(espaciosConDatosCompletos);
    });
});

// Endpoint para obtener un espacio específico
app.get('/api/espacios/:id', (req, res) => {
    console.log('Endpoint /api/espacios/:id llamado');

    const { id } = req.params;

    const query = `
        SELECT 
            e.id,
            e.nombre,
            e.capacidad as capacidadMaxima,
            e.costo_base as costoBase,
            e.descripcion,
            e.disponible,
            e.fecha_creacion,
            COUNT(r.id) as reservasActuales
        FROM espacio e
        LEFT JOIN reserva r ON e.id = r.espacio_id 
            AND r.estado IN ('pendiente', 'confirmada')
            AND r.fecha_reserva >= NOW()
        WHERE e.id = ?
        GROUP BY e.id, e.nombre, e.capacidad, e.costo_base, e.descripcion, e.disponible, e.fecha_creacion
    `;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener espacio:', err);
            return res.status(500).json({ error: 'Error al obtener espacio' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Espacio no encontrado' });
        }

        const espacio = results[0];
        const espacioCompleto = {
            id: espacio.id,
            nombre: espacio.nombre,
            descripcion: espacio.descripcion || '',
            capacidadMaxima: espacio.capacidadMaxima,
            costoBase: parseFloat(espacio.costoBase),
            ubicacion: 'No especificada',
            disponible: !!espacio.disponible, // CAMBIO: Usar valor real de la BD
            equipamiento: 'No especificado',
            caracteristicas: 'No especificadas',
            tipoEspacio: 'Otro',
            dimensiones: 'No especificadas',
            observaciones: '',
            reservasActuales: espacio.reservasActuales || 0
        };

        res.status(200).json(espacioCompleto);
    });
});

// Endpoint para crear un nuevo espacio
app.post('/api/espacios', (req, res) => {
    console.log('Endpoint POST /api/espacios llamado');
    console.log('Datos recibidos:', req.body);

    const { nombre, descripcion, capacidadMaxima, costoBase } = req.body;

    // Validaciones básicas
    if (!nombre || !capacidadMaxima || !costoBase) {
        return res.status(400).json({
            error: 'Los campos nombre, capacidadMaxima y costoBase son obligatorios'
        });
    }

    const query = 'INSERT INTO espacio (nombre, capacidad, costo_base, descripcion, disponible) VALUES (?, ?, ?, ?, ?)';

    connection.query(query, [nombre, capacidadMaxima, costoBase, descripcion || '', true], (err, result) => {
        if (err) {
            console.error('Error al crear espacio:', err);
            return res.status(500).json({ error: 'Error al crear espacio' });
        }

        const nuevoEspacio = {
            id: result.insertId,
            nombre,
            descripcion: descripcion || '',
            capacidadMaxima: parseInt(capacidadMaxima),
            costoBase: parseFloat(costoBase),
            ubicacion: 'No especificada',
            disponible: true, // Nuevo espacio disponible por defecto
            equipamiento: 'No especificado',
            caracteristicas: 'No especificadas',
            tipoEspacio: 'Otro',
            dimensiones: 'No especificadas',
            observaciones: '',
            reservasActuales: 0
        };

        console.log('Espacio creado con ID:', result.insertId);
        res.status(201).json(nuevoEspacio);
    });
});

// Endpoint para actualizar un espacio
app.put('/api/espacios/:id', (req, res) => {
    console.log('Endpoint PUT /api/espacios llamado');

    const { id } = req.params;
    const { nombre, descripcion, capacidadMaxima, costoBase } = req.body;

    // Validaciones básicas
    if (!nombre || !capacidadMaxima || !costoBase) {
        return res.status(400).json({
            error: 'Los campos nombre, capacidadMaxima y costoBase son obligatorios'
        });
    }

    const query = 'UPDATE espacio SET nombre = ?, capacidad = ?, costo_base = ?, descripcion = ? WHERE id = ?';

    connection.query(query, [nombre, capacidadMaxima, costoBase, descripcion || '', id], (err, result) => {
        if (err) {
            console.error('Error al actualizar espacio:', err);
            return res.status(500).json({ error: 'Error al actualizar espacio' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Espacio no encontrado' });
        }

        // Obtener el valor actual de disponible
        connection.query('SELECT disponible FROM espacio WHERE id = ?', [id], (err, results) => {
            const disponible = results.length > 0 ? !!results[0].disponible : true;

            const espacioActualizado = {
                id: parseInt(id),
                nombre,
                descripcion: descripcion || '',
                capacidadMaxima: parseInt(capacidadMaxima),
                costoBase: parseFloat(costoBase),
                ubicacion: 'No especificada',
                disponible: disponible, // Mantener valor actual
                equipamiento: 'No especificado',
                caracteristicas: 'No especificadas',
                tipoEspacio: 'Otro',
                dimensiones: 'No especificadas',
                observaciones: '',
                reservasActuales: 0
            };

            console.log('Espacio actualizado:', id);
            res.status(200).json(espacioActualizado);
        });
    });
});

// Endpoint para eliminar un espacio
app.delete('/api/espacios/:id', (req, res) => {
    console.log('Endpoint DELETE /api/espacios llamado');

    const { id } = req.params;

    // Verificar si el espacio tiene reservas activas
    const checkReservasQuery = `
        SELECT COUNT(*) as count 
        FROM reserva 
        WHERE espacio_id = ? AND estado IN ('pendiente', 'confirmada')
    `;

    connection.query(checkReservasQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar reservas:', err);
            return res.status(500).json({ error: 'Error al verificar reservas' });
        }

        if (results[0].count > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar el espacio porque tiene reservas activas'
            });
        }

        // Eliminar espacio
        const deleteQuery = 'DELETE FROM espacio WHERE id = ?';

        connection.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar espacio:', err);
                return res.status(500).json({ error: 'Error al eliminar espacio' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Espacio no encontrado' });
            }

            console.log('Espacio eliminado:', id);
            res.status(200).json({ message: 'Espacio eliminado correctamente' });
        });
    });
});
// Endpoint para cambiar disponibilidad de un espacio
app.patch('/api/espacios/:id/disponibilidad', (req, res) => {
    console.log('Endpoint PATCH /api/espacios/:id/disponibilidad llamado');

    const { id } = req.params;
    const { disponible } = req.body;

    if (typeof disponible !== 'boolean') {
        return res.status(400).json({ error: 'El campo disponible debe ser un valor booleano' });
    }

    const updateQuery = 'UPDATE espacio SET disponible = ? WHERE id = ?';

    connection.query(updateQuery, [disponible, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar disponibilidad:', err);
            return res.status(500).json({ error: 'Error al actualizar disponibilidad' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Espacio no encontrado' });
        }

        console.log('Disponibilidad actualizada para espacio:', id, 'nueva disponibilidad:', disponible);
        res.status(200).json({
            message: 'Disponibilidad actualizada correctamente',
            disponible: disponible
        });
    });
});
// ===== ENDPOINTS PARA PAGOS =====

// Endpoint para obtener todos los pagos con información completa
app.get('/api/pagos', (req, res) => {
    console.log('Endpoint /api/pagos llamado');

    const query = `
        SELECT 
            p.id,
            p.monto_total,
            p.abono,
            p.fecha_pago,
            p.fecha_creacion,
            r.id as reserva_id,
            r.fecha_reserva,
            r.estado as estado_reserva,
            r.cantidad_personas,
            r.razon,
            c.nombre as cliente_nombre,
            c.rut as cliente_rut,
            c.correo as cliente_correo,
            e.nombre as espacio_nombre,
            e.costo_base as costo_base,
            COALESCE(SUM(s.costo), 0) as costo_servicios_adicionales
        FROM pago p
        JOIN reserva r ON p.reserva_id = r.id
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        LEFT JOIN reserva_servicio rs ON r.id = rs.reserva_id
        LEFT JOIN servicio s ON rs.servicio_id = s.id
        GROUP BY p.id, p.monto_total, p.abono, p.fecha_pago, p.fecha_creacion,
                 r.id, r.fecha_reserva, r.estado, r.cantidad_personas, r.razon,
                 c.nombre, c.rut, c.correo, e.nombre, e.costo_base
        ORDER BY p.fecha_creacion DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener pagos:', err);
            return res.status(500).json({ error: 'Error al obtener pagos' });
        }

        // Transformar los datos para el frontend
        const pagosFormatted = results.map(pago => {
            const costoTotal = parseFloat(pago.costo_base) + parseFloat(pago.costo_servicios_adicionales);
            const montoPagado = parseFloat(pago.abono);
            const saldoPendiente = costoTotal - montoPagado;

            return {
                id: pago.id,
                reservaId: pago.reserva_id,
                clienteNombre: pago.cliente_nombre,
                clienteRut: pago.cliente_rut,
                clienteCorreo: pago.cliente_correo,
                espacioNombre: pago.espacio_nombre,
                fechaEvento: pago.fecha_reserva.toISOString().split('T')[0],
                monto: montoPagado,
                metodoPago: 'No especificado', // Campo no existe en BD, valor por defecto
                fechaPago: pago.fecha_pago.toISOString().split('T')[0],
                tipoPago: montoPagado >= costoTotal ? 'pago_total' : 'abono',
                estado: 'confirmado', // Campo no existe en BD, valor por defecto
                comprobante: `PAG-${pago.id.toString().padStart(3, '0')}-2025`,
                observaciones: `Razón del evento: ${pago.razon}`,
                costoTotal: costoTotal,
                montoPagado: montoPagado,
                saldoPendiente: Math.max(0, saldoPendiente),
                cantidadPersonas: pago.cantidad_personas,
                estadoReserva: pago.estado_reserva
            };
        });

        console.log('Pagos obtenidos:', pagosFormatted.length);
        res.status(200).json(pagosFormatted);
    });
});

// Endpoint para obtener reservas disponibles para pagos
app.get('/api/reservas-para-pagos', (req, res) => {
    console.log('Endpoint /api/reservas-para-pagos llamado');

    const query = `
        SELECT 
            r.id,
            r.fecha_reserva,
            r.estado,
            r.cantidad_personas,
            r.razon,
            c.nombre as cliente_nombre,
            c.rut as cliente_rut,
            e.nombre as espacio_nombre,
            e.costo_base,
            COALESCE(SUM(s.costo), 0) as costo_servicios_adicionales,
            COALESCE(SUM(p.abono), 0) as total_pagado
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        LEFT JOIN reserva_servicio rs ON r.id = rs.reserva_id
        LEFT JOIN servicio s ON rs.servicio_id = s.id
        LEFT JOIN pago p ON r.id = p.reserva_id
        WHERE r.estado IN ('pendiente', 'confirmada')
        GROUP BY r.id, r.fecha_reserva, r.estado, r.cantidad_personas, r.razon,
                 c.nombre, c.rut, e.nombre, e.costo_base
        ORDER BY r.fecha_reserva ASC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener reservas para pagos:', err);
            return res.status(500).json({ error: 'Error al obtener reservas' });
        }

        const reservasFormatted = results.map(reserva => {
            const costoTotal = parseFloat(reserva.costo_base) + parseFloat(reserva.costo_servicios_adicionales);
            const totalPagado = parseFloat(reserva.total_pagado);
            const saldoPendiente = costoTotal - totalPagado;

            return {
                id: reserva.id,
                clienteNombre: reserva.cliente_nombre,
                clienteRut: reserva.cliente_rut,
                espacioNombre: reserva.espacio_nombre,
                fechaEvento: reserva.fecha_reserva.toISOString().split('T')[0],
                razon: reserva.razon,
                costoTotal: costoTotal,
                totalPagado: totalPagado,
                saldoPendiente: Math.max(0, saldoPendiente),
                estado: reserva.estado,
                cantidadPersonas: reserva.cantidad_personas
            };
        });

        console.log('Reservas para pagos obtenidas:', reservasFormatted.length);
        res.status(200).json(reservasFormatted);
    });
});

// Endpoint para crear un nuevo pago
app.post('/api/pagos', (req, res) => {
    console.log('Endpoint POST /api/pagos llamado');
    console.log('Datos recibidos:', req.body);

    const { reservaId, monto, fechaPago } = req.body;

    if (!reservaId || !monto || !fechaPago) {
        return res.status(400).json({
            error: 'Los campos reservaId, monto y fechaPago son obligatorios'
        });
    }

    // Primero verificar que la reserva existe
    const checkReservaQuery = `
        SELECT r.id, e.costo_base, COALESCE(SUM(s.costo), 0) as costo_servicios
        FROM reserva r
        JOIN espacio e ON r.espacio_id = e.id
        LEFT JOIN reserva_servicio rs ON r.id = rs.reserva_id
        LEFT JOIN servicio s ON rs.servicio_id = s.id
        WHERE r.id = ?
        GROUP BY r.id, e.costo_base
    `;

    connection.query(checkReservaQuery, [reservaId], (err, reservaResults) => {
        if (err) {
            console.error('Error al verificar reserva:', err);
            return res.status(500).json({ error: 'Error al verificar reserva' });
        }

        if (reservaResults.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const reserva = reservaResults[0];
        const costoTotal = parseFloat(reserva.costo_base) + parseFloat(reserva.costo_servicios);

        // Verificar que el monto no exceda el costo total
        if (parseFloat(monto) > costoTotal) {
            return res.status(400).json({
                error: `El monto no puede exceder el costo total de la reserva ($${costoTotal})`
            });
        }

        // Insertar el nuevo pago
        const insertQuery = `
            INSERT INTO pago (monto_total, abono, fecha_pago, reserva_id) 
            VALUES (?, ?, ?, ?)
        `;

        connection.query(insertQuery, [costoTotal, monto, fechaPago, reservaId], (err, result) => {
            if (err) {
                console.error('Error al crear pago:', err);
                return res.status(500).json({ error: 'Error al crear pago' });
            }

            console.log('Pago creado con ID:', result.insertId);
            res.status(201).json({
                message: 'Pago registrado correctamente',
                id: result.insertId
            });
        });
    });
});

// Endpoint para actualizar un pago
app.put('/api/pagos/:id', (req, res) => {
    console.log('Endpoint PUT /api/pagos llamado');

    const { id } = req.params;
    const { monto, fechaPago } = req.body;

    if (!monto || !fechaPago) {
        return res.status(400).json({
            error: 'Los campos monto y fechaPago son obligatorios'
        });
    }

    const updateQuery = 'UPDATE pago SET abono = ?, fecha_pago = ? WHERE id = ?';

    connection.query(updateQuery, [monto, fechaPago, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar pago:', err);
            return res.status(500).json({ error: 'Error al actualizar pago' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        console.log('Pago actualizado:', id);
        res.status(200).json({ message: 'Pago actualizado correctamente' });
    });
});

// Endpoint para eliminar un pago
app.delete('/api/pagos/:id', (req, res) => {
    console.log('Endpoint DELETE /api/pagos llamado');

    const { id } = req.params;

    const deleteQuery = 'DELETE FROM pago WHERE id = ?';

    connection.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar pago:', err);
            return res.status(500).json({ error: 'Error al eliminar pago' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }

        console.log('Pago eliminado:', id);
        res.status(200).json({ message: 'Pago eliminado correctamente' });
    });
});

// Endpoint para obtener estadísticas de pagos
app.get('/api/pagos/estadisticas', (req, res) => {
    console.log('Endpoint /api/pagos/estadisticas llamado');

    const statsQuery = `
        SELECT 
            COALESCE(SUM(p.abono), 0) as total_ingresos,
            COUNT(p.id) as total_transacciones,
            COALESCE(SUM(CASE WHEN DATE(p.fecha_pago) = CURDATE() THEN p.abono ELSE 0 END), 0) as pagos_hoy,
            COALESCE(SUM(
                CASE WHEN r.estado IN ('pendiente', 'confirmada') 
                THEN (e.costo_base + COALESCE(servicios.costo_total, 0)) - COALESCE(pagos_total.total_pagado, 0)
                ELSE 0 END
            ), 0) as pagos_pendientes
        FROM pago p
        JOIN reserva r ON p.reserva_id = r.id
        JOIN espacio e ON r.espacio_id = e.id
        LEFT JOIN (
            SELECT rs.reserva_id, SUM(s.costo) as costo_total
            FROM reserva_servicio rs
            JOIN servicio s ON rs.servicio_id = s.id
            GROUP BY rs.reserva_id
        ) servicios ON r.id = servicios.reserva_id
        LEFT JOIN (
            SELECT reserva_id, SUM(abono) as total_pagado
            FROM pago
            GROUP BY reserva_id
        ) pagos_total ON r.id = pagos_total.reserva_id
    `;

    connection.query(statsQuery, (err, results) => {
        if (err) {
            console.error('Error al obtener estadísticas de pagos:', err);
            return res.status(500).json({ error: 'Error al obtener estadísticas' });
        }

        const stats = results[0] || {
            total_ingresos: 0,
            total_transacciones: 0,
            pagos_hoy: 0,
            pagos_pendientes: 0
        };

        console.log('Estadísticas de pagos obtenidas:', stats);
        res.status(200).json({
            totalIngresos: parseFloat(stats.total_ingresos),
            totalTransacciones: parseInt(stats.total_transacciones),
            pagosHoy: parseFloat(stats.pagos_hoy),
            pagosPendientes: parseFloat(stats.pagos_pendientes)
        });
    });
});

// Endpoint para obtener todos los servicios
app.get('/api/servicios', (req, res) => {
    console.log('Endpoint /api/servicios llamado');

    const query = `
        SELECT 
            s.id,
            s.nombre,
            s.costo as precio,
            s.fecha_creacion,
            COUNT(rs.servicio_id) as reservasActivas
        FROM servicio s
        LEFT JOIN reserva_servicio rs ON s.id = rs.servicio_id
        LEFT JOIN reserva r ON rs.reserva_id = r.id 
            AND r.estado IN ('pendiente', 'confirmada')
            AND r.fecha_reserva >= NOW()
        GROUP BY s.id, s.nombre, s.costo, s.fecha_creacion
        ORDER BY s.nombre
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener servicios:', err);
            return res.status(500).json({ error: 'Error al obtener servicios' });
        }

        // Mapear los datos para incluir campos adicionales que maneja el frontend
        const serviciosConDatosCompletos = results.map(servicio => ({
            id: servicio.id,
            nombre: servicio.nombre,
            descripcion: 'Sin descripción específica', // Campo no existe en BD, valor por defecto
            precio: parseFloat(servicio.precio),
            categoria: 'Otros', // Campo no existe en BD, valor por defecto
            disponible: true, // Campo no existe en BD, valor por defecto
            proveedorExterno: false, // Campo no existe en BD, valor por defecto
            tiempoPreparacion: '1 día', // Campo no existe en BD, valor por defecto
            observaciones: '', // Campo no existe en BD, valor por defecto
            reservasActivas: servicio.reservasActivas || 0
        }));

        console.log('Servicios obtenidos:', serviciosConDatosCompletos.length);
        res.status(200).json(serviciosConDatosCompletos);
    });
});

// Endpoint para obtener un servicio específico
app.get('/api/servicios/:id', (req, res) => {
    console.log('Endpoint /api/servicios/:id llamado');

    const { id } = req.params;

    const query = `
        SELECT 
            s.id,
            s.nombre,
            s.costo as precio,
            s.fecha_creacion,
            COUNT(rs.servicio_id) as reservasActivas
        FROM servicio s
        LEFT JOIN reserva_servicio rs ON s.id = rs.servicio_id
        LEFT JOIN reserva r ON rs.reserva_id = r.id 
            AND r.estado IN ('pendiente', 'confirmada')
            AND r.fecha_reserva >= NOW()
        WHERE s.id = ?
        GROUP BY s.id, s.nombre, s.costo, s.fecha_creacion
    `;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener servicio:', err);
            return res.status(500).json({ error: 'Error al obtener servicio' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        const servicio = results[0];
        const servicioCompleto = {
            id: servicio.id,
            nombre: servicio.nombre,
            descripcion: 'Sin descripción específica',
            precio: parseFloat(servicio.precio),
            categoria: 'Otros',
            disponible: true,
            proveedorExterno: false,
            tiempoPreparacion: '1 día',
            observaciones: '',
            reservasActivas: servicio.reservasActivas || 0
        };

        res.status(200).json(servicioCompleto);
    });
});

// Endpoint para crear un nuevo servicio
app.post('/api/servicios', (req, res) => {
    console.log('Endpoint POST /api/servicios llamado');
    console.log('Datos recibidos:', req.body);

    const { nombre, precio } = req.body;

    // Validaciones básicas
    if (!nombre || !precio) {
        return res.status(400).json({
            error: 'Los campos nombre y precio son obligatorios'
        });
    }

    const query = 'INSERT INTO servicio (nombre, costo) VALUES (?, ?)';

    connection.query(query, [nombre, parseFloat(precio)], (err, result) => {
        if (err) {
            console.error('Error al crear servicio:', err);
            return res.status(500).json({ error: 'Error al crear servicio' });
        }

        const nuevoServicio = {
            id: result.insertId,
            nombre,
            descripcion: 'Sin descripción específica',
            precio: parseFloat(precio),
            categoria: 'Otros',
            disponible: true,
            proveedorExterno: false,
            tiempoPreparacion: '1 día',
            observaciones: '',
            reservasActivas: 0
        };

        console.log('Servicio creado con ID:', result.insertId);
        res.status(201).json(nuevoServicio);
    });
});

// Endpoint para actualizar un servicio
app.put('/api/servicios/:id', (req, res) => {
    console.log('Endpoint PUT /api/servicios llamado');

    const { id } = req.params;
    const { nombre, precio } = req.body;

    // Validaciones básicas
    if (!nombre || !precio) {
        return res.status(400).json({
            error: 'Los campos nombre y precio son obligatorios'
        });
    }

    const query = 'UPDATE servicio SET nombre = ?, costo = ? WHERE id = ?';

    connection.query(query, [nombre, parseFloat(precio), id], (err, result) => {
        if (err) {
            console.error('Error al actualizar servicio:', err);
            return res.status(500).json({ error: 'Error al actualizar servicio' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        const servicioActualizado = {
            id: parseInt(id),
            nombre,
            descripcion: 'Sin descripción específica',
            precio: parseFloat(precio),
            categoria: 'Otros',
            disponible: true,
            proveedorExterno: false,
            tiempoPreparacion: '1 día',
            observaciones: '',
            reservasActivas: 0
        };

        console.log('Servicio actualizado:', id);
        res.status(200).json(servicioActualizado);
    });
});

// Endpoint para eliminar un servicio
app.delete('/api/servicios/:id', (req, res) => {
    console.log('Endpoint DELETE /api/servicios llamado');

    const { id } = req.params;

    // Primero verificar si el servicio tiene reservas activas
    const checkQuery = `
        SELECT COUNT(*) as reservasActivas 
        FROM reserva_servicio rs
        INNER JOIN reserva r ON rs.reserva_id = r.id
        WHERE rs.servicio_id = ? AND r.estado IN ('pendiente', 'confirmada')
    `;

    connection.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar reservas:', err);
            return res.status(500).json({ error: 'Error al verificar reservas activas' });
        }

        const reservasActivas = results[0].reservasActivas;
        if (reservasActivas > 0) {
            return res.status(400).json({
                error: `No se puede eliminar el servicio porque tiene ${reservasActivas} reserva(s) activa(s)`
            });
        }

        // Si no hay reservas activas, proceder a eliminar
        const deleteQuery = 'DELETE FROM servicio WHERE id = ?';

        connection.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error('Error al eliminar servicio:', err);
                return res.status(500).json({ error: 'Error al eliminar servicio' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Servicio no encontrado' });
            }

            console.log('Servicio eliminado:', id);
            res.status(200).json({ message: 'Servicio eliminado correctamente' });
        });
    });
});
// ===== ENDPOINTS PARA RESERVAS =====

// Endpoint para obtener todas las reservas con información completa
app.get('/api/reservas', (req, res) => {
    console.log('Endpoint /api/reservas llamado');

    const query = `
        SELECT 
            r.id,
            r.fecha_reserva,
            r.estado,
            r.cantidad_personas,
            r.razon,
            r.fecha_creacion,
            c.id as cliente_id,
            c.nombre as cliente_nombre,
            c.rut as cliente_rut,
            e.id as espacio_id,
            e.nombre as espacio_nombre,
            e.costo_base as espacio_costo,
            GROUP_CONCAT(s.id) as servicios_ids,
            GROUP_CONCAT(s.nombre) as servicios_nombres,
            GROUP_CONCAT(s.costo) as servicios_costos,
            COALESCE(SUM(s.costo), 0) as total_servicios,
            COALESCE(pagos.total_pagado, 0) as total_pagado
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        LEFT JOIN reserva_servicio rs ON r.id = rs.reserva_id
        LEFT JOIN servicio s ON rs.servicio_id = s.id
        LEFT JOIN (
            SELECT reserva_id, SUM(abono) as total_pagado
            FROM pago
            GROUP BY reserva_id
        ) pagos ON r.id = pagos.reserva_id
        GROUP BY r.id, r.fecha_reserva, r.estado, r.cantidad_personas, r.razon, r.fecha_creacion,
                 c.id, c.nombre, c.rut, e.id, e.nombre, e.costo_base, pagos.total_pagado
        ORDER BY r.fecha_reserva DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener reservas:', err);
            return res.status(500).json({ error: 'Error al obtener reservas' });
        }

        // Transformar los datos para el formato esperado por el frontend
        const reservasFormatted = results.map(reserva => {
            const fechaReserva = new Date(reserva.fecha_reserva);
            const costoEspacio = parseFloat(reserva.espacio_costo);
            const costoServicios = parseFloat(reserva.total_servicios);
            const costoTotal = costoEspacio + costoServicios;
            const totalPagado = parseFloat(reserva.total_pagado);
            const saldoPendiente = costoTotal - totalPagado;

            // Procesar servicios
            let serviciosSeleccionados = [];
            let serviciosNombres = [];

            if (reserva.servicios_ids) {
                serviciosSeleccionados = reserva.servicios_ids.split(',').map(id => parseInt(id));
                serviciosNombres = reserva.servicios_nombres.split(',');
            }

            return {
                id: reserva.id,
                clienteId: reserva.cliente_id,
                clienteNombre: reserva.cliente_nombre,
                espacioId: reserva.espacio_id,
                espacioNombre: reserva.espacio_nombre,
                fechaEvento: fechaReserva.toISOString().split('T')[0],
                horaInicio: fechaReserva.toTimeString().substring(0, 5),
                horaFin: new Date(fechaReserva.getTime() + 4 * 60 * 60 * 1000).toTimeString().substring(0, 5), // +4 horas por defecto
                tipoEvento: reserva.razon,
                numeroPersonas: reserva.cantidad_personas,
                serviciosSeleccionados: serviciosSeleccionados,
                serviciosNombres: serviciosNombres,
                estado: reserva.estado,
                fechaCreacion: reserva.fecha_creacion.toISOString().split('T')[0],
                observaciones: `Cliente: ${reserva.cliente_nombre} (${reserva.cliente_rut})`,
                costoEspacio: costoEspacio,
                costoServicios: costoServicios,
                descuento: 0, // No existe en BD, valor por defecto
                costoTotal: costoTotal,
                anticipo: totalPagado,
                saldoPendiente: Math.max(0, saldoPendiente)
            };
        });

        console.log('Reservas obtenidas:', reservasFormatted.length);
        res.status(200).json(reservasFormatted);
    });
});

// Endpoint para obtener clientes para el dropdown
app.get('/api/reservas/clientes', (req, res) => {
    console.log('Endpoint /api/reservas/clientes llamado');

    const query = 'SELECT id, nombre FROM cliente ORDER BY nombre';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener clientes:', err);
            return res.status(500).json({ error: 'Error al obtener clientes' });
        }

        console.log('Clientes para reservas obtenidos:', results.length);
        res.status(200).json(results);
    });
});

// Endpoint para obtener espacios para el dropdown
app.get('/api/reservas/espacios', (req, res) => {
    console.log('Endpoint /api/reservas/espacios llamado');

    const query = 'SELECT id, nombre, capacidad, costo_base as costo FROM espacio ORDER BY nombre';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener espacios:', err);
            return res.status(500).json({ error: 'Error al obtener espacios' });
        }

        const espaciosFormatted = results.map(espacio => ({
            id: espacio.id,
            nombre: espacio.nombre,
            capacidad: espacio.capacidad,
            costo: parseFloat(espacio.costo)
        }));

        console.log('Espacios para reservas obtenidos:', espaciosFormatted.length);
        res.status(200).json(espaciosFormatted);
    });
});

// Endpoint para obtener servicios para el dropdown
app.get('/api/reservas/servicios', (req, res) => {
    console.log('Endpoint /api/reservas/servicios llamado');

    const query = 'SELECT id, nombre, costo as precio FROM servicio ORDER BY nombre';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener servicios:', err);
            return res.status(500).json({ error: 'Error al obtener servicios' });
        }

        const serviciosFormatted = results.map(servicio => ({
            id: servicio.id,
            nombre: servicio.nombre,
            precio: parseFloat(servicio.precio)
        }));

        console.log('Servicios para reservas obtenidos:', serviciosFormatted.length);
        res.status(200).json(serviciosFormatted);
    });
});

// Endpoint para crear una nueva reserva
app.post('/api/reservas', (req, res) => {
    console.log('Endpoint POST /api/reservas llamado');
    console.log('Datos recibidos:', req.body);

    const {
        clienteId,
        espacioId,
        fechaEvento,
        horaInicio,
        tipoEvento,
        numeroPersonas,
        serviciosSeleccionados,
        estado,
        anticipo
    } = req.body;

    // Validaciones
    if (!clienteId || !espacioId || !fechaEvento || !horaInicio || !tipoEvento || !numeroPersonas) {
        return res.status(400).json({
            error: 'Los campos clienteId, espacioId, fechaEvento, horaInicio, tipoEvento y numeroPersonas son obligatorios'
        });
    }

    // Combinar fecha y hora
    const fechaReserva = `${fechaEvento} ${horaInicio}:00`;

    // Verificar disponibilidad del espacio
    const checkDisponibilidadQuery = `
        SELECT id FROM reserva 
        WHERE espacio_id = ? 
        AND DATE(fecha_reserva) = ? 
        AND estado IN ('pendiente', 'confirmada')
    `;

    connection.query(checkDisponibilidadQuery, [espacioId, fechaEvento], (err, conflictos) => {
        if (err) {
            console.error('Error al verificar disponibilidad:', err);
            return res.status(500).json({ error: 'Error al verificar disponibilidad' });
        }

        if (conflictos.length > 0) {
            return res.status(409).json({
                error: 'El espacio ya está reservado para esa fecha'
            });
        }

        // Insertar la reserva
        const insertReservaQuery = `
            INSERT INTO reserva (fecha_reserva, estado, cantidad_personas, razon, cliente_id, espacio_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        connection.query(insertReservaQuery, [
            fechaReserva,
            estado || 'pendiente',
            numeroPersonas,
            tipoEvento,
            clienteId,
            espacioId
        ], (err, reservaResult) => {
            if (err) {
                console.error('Error al crear reserva:', err);
                return res.status(500).json({ error: 'Error al crear reserva' });
            }

            const reservaId = reservaResult.insertId;

            // Insertar servicios seleccionados
            if (serviciosSeleccionados && serviciosSeleccionados.length > 0) {
                const insertServiciosQuery = 'INSERT INTO reserva_servicio (reserva_id, servicio_id) VALUES ?';
                const serviciosValues = serviciosSeleccionados.map(servicioId => [reservaId, servicioId]);

                connection.query(insertServiciosQuery, [serviciosValues], (err) => {
                    if (err) {
                        console.error('Error al insertar servicios:', err);
                        // No retornamos error aquí, la reserva ya se creó
                    }
                });
            }

            // Crear pago inicial si hay anticipo
            if (anticipo && anticipo > 0) {
                // Obtener costo total
                const getCostoQuery = `
                    SELECT e.costo_base, COALESCE(SUM(s.costo), 0) as costo_servicios
                    FROM espacio e
                    LEFT JOIN reserva_servicio rs ON rs.reserva_id = ?
                    LEFT JOIN servicio s ON rs.servicio_id = s.id
                    WHERE e.id = ?
                    GROUP BY e.id, e.costo_base
                `;

                connection.query(getCostoQuery, [reservaId, espacioId], (err, costoResults) => {
                    if (!err && costoResults.length > 0) {
                        const costoTotal = parseFloat(costoResults[0].costo_base) + parseFloat(costoResults[0].costo_servicios);

                        const insertPagoQuery = `
                            INSERT INTO pago (monto_total, abono, fecha_pago, reserva_id)
                            VALUES (?, ?, NOW(), ?)
                        `;

                        connection.query(insertPagoQuery, [costoTotal, anticipo, reservaId], (err) => {
                            if (err) {
                                console.error('Error al crear pago inicial:', err);
                            }
                        });
                    }
                });
            }

            console.log('Reserva creada con ID:', reservaId);
            res.status(201).json({
                message: 'Reserva creada correctamente',
                id: reservaId
            });
        });
    });
});

// Endpoint para actualizar una reserva
app.put('/api/reservas/:id', (req, res) => {
    console.log('Endpoint PUT /api/reservas llamado');

    const { id } = req.params;
    const {
        clienteId,
        espacioId,
        fechaEvento,
        horaInicio,
        tipoEvento,
        numeroPersonas,
        serviciosSeleccionados,
        estado
    } = req.body;

    if (!clienteId || !espacioId || !fechaEvento || !horaInicio || !tipoEvento || !numeroPersonas) {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios'
        });
    }

    const fechaReserva = `${fechaEvento} ${horaInicio}:00`;

    // Verificar disponibilidad (excluyendo la reserva actual)
    const checkDisponibilidadQuery = `
        SELECT id FROM reserva 
        WHERE espacio_id = ? 
        AND DATE(fecha_reserva) = ? 
        AND estado IN ('pendiente', 'confirmada')
        AND id != ?
    `;

    connection.query(checkDisponibilidadQuery, [espacioId, fechaEvento, id], (err, conflictos) => {
        if (err) {
            console.error('Error al verificar disponibilidad:', err);
            return res.status(500).json({ error: 'Error al verificar disponibilidad' });
        }

        if (conflictos.length > 0) {
            return res.status(409).json({
                error: 'El espacio ya está reservado para esa fecha'
            });
        }

        // Actualizar la reserva
        const updateReservaQuery = `
            UPDATE reserva 
            SET fecha_reserva = ?, estado = ?, cantidad_personas = ?, razon = ?, cliente_id = ?, espacio_id = ?
            WHERE id = ?
        `;

        connection.query(updateReservaQuery, [
            fechaReserva,
            estado,
            numeroPersonas,
            tipoEvento,
            clienteId,
            espacioId,
            id
        ], (err, result) => {
            if (err) {
                console.error('Error al actualizar reserva:', err);
                return res.status(500).json({ error: 'Error al actualizar reserva' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }

            // Eliminar servicios anteriores
            connection.query('DELETE FROM reserva_servicio WHERE reserva_id = ?', [id], (err) => {
                if (err) {
                    console.error('Error al eliminar servicios anteriores:', err);
                }

                // Insertar nuevos servicios
                if (serviciosSeleccionados && serviciosSeleccionados.length > 0) {
                    const insertServiciosQuery = 'INSERT INTO reserva_servicio (reserva_id, servicio_id) VALUES ?';
                    const serviciosValues = serviciosSeleccionados.map(servicioId => [id, servicioId]);

                    connection.query(insertServiciosQuery, [serviciosValues], (err) => {
                        if (err) {
                            console.error('Error al insertar nuevos servicios:', err);
                        }
                    });
                }
            });

            console.log('Reserva actualizada:', id);
            res.status(200).json({ message: 'Reserva actualizada correctamente' });
        });
    });
});

// Endpoint para cambiar estado de una reserva
app.patch('/api/reservas/:id/estado', (req, res) => {
    console.log('Endpoint PATCH /api/reservas/:id/estado llamado');

    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ error: 'El estado es obligatorio' });
    }

    const validStates = ['pendiente', 'confirmada', 'cancelada'];
    if (!validStates.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }

    const updateQuery = 'UPDATE reserva SET estado = ? WHERE id = ?';

    connection.query(updateQuery, [estado, id], (err, result) => {
        if (err) {
            console.error('Error al cambiar estado:', err);
            return res.status(500).json({ error: 'Error al cambiar estado' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        console.log('Estado de reserva actualizado:', id, 'nuevo estado:', estado);
        res.status(200).json({ message: 'Estado actualizado correctamente' });
    });
});
// ===== ENDPOINTS PARA REPORTES =====

// Endpoint para obtener estadísticas generales
app.get('/api/reportes/estadisticas-generales', (req, res) => {
    console.log('Endpoint /api/reportes/estadisticas-generales llamado');

    const { desde, hasta } = req.query;
    const fechaDesde = desde || '2025-01-01';
    const fechaHasta = hasta || new Date().toISOString().split('T')[0];

    const statsQuery = `
        SELECT 
            COALESCE(SUM(p.abono), 0) as totalIngresos,
            COUNT(DISTINCT r.id) as totalReservas,
            ROUND(COUNT(DISTINCT r.id) / NULLIF(DATEDIFF(?, ?), 0) * 30, 1) as promedioReservaMes,
            ROUND(COALESCE(SUM(p.abono), 0) / NULLIF(COUNT(DISTINCT r.id), 0), 0) as promedioIngresoReserva,
            COUNT(DISTINCT r.cliente_id) as clientesActivos,
            COUNT(DISTINCT rs.servicio_id) as serviciosContratados
        FROM reserva r
        LEFT JOIN pago p ON r.id = p.reserva_id
        LEFT JOIN reserva_servicio rs ON r.id = rs.reserva_id
        WHERE DATE(r.fecha_reserva) BETWEEN ? AND ?
    `;

    connection.query(statsQuery, [fechaHasta, fechaDesde, fechaDesde, fechaHasta], (err, results) => {
        if (err) {
            console.error('Error al obtener estadísticas generales:', err);
            return res.status(500).json({ error: 'Error al obtener estadísticas generales' });
        }

        // Calcular tasa de ocupación y crecimiento
        const ocupacionQuery = `
            SELECT 
                COUNT(DISTINCT r.id) as reservasConfirmadas,
                COUNT(DISTINCT e.id) as totalEspacios,
                DATEDIFF(?, ?) as diasPeriodo
            FROM reserva r
            CROSS JOIN espacio e
            WHERE DATE(r.fecha_reserva) BETWEEN ? AND ?
            AND r.estado IN ('confirmada', 'completada')
        `;

        connection.query(ocupacionQuery, [fechaHasta, fechaDesde, fechaDesde, fechaHasta], (err, ocupacionResults) => {
            if (err) {
                console.error('Error al calcular ocupación:', err);
                return res.status(500).json({ error: 'Error al calcular ocupación' });
            }

            // Calcular crecimiento mensual
            const crecimientoQuery = `
                SELECT 
                    COALESCE(SUM(CASE WHEN MONTH(r.fecha_reserva) = MONTH(CURDATE()) THEN p.abono ELSE 0 END), 0) as ingresosMesActual,
                    COALESCE(SUM(CASE WHEN MONTH(r.fecha_reserva) = MONTH(CURDATE()) - 1 THEN p.abono ELSE 0 END), 0) as ingresosMesAnterior
                FROM reserva r
                LEFT JOIN pago p ON r.id = p.reserva_id
                WHERE YEAR(r.fecha_reserva) = YEAR(CURDATE())
            `;

            connection.query(crecimientoQuery, (err, crecimientoResults) => {
                if (err) {
                    console.error('Error al calcular crecimiento:', err);
                    return res.status(500).json({ error: 'Error al calcular crecimiento' });
                }

                const stats = results[0];
                const ocupacion = ocupacionResults[0];
                const crecimiento = crecimientoResults[0];

                const tasaOcupacion = ocupacion.totalEspacios > 0 && ocupacion.diasPeriodo > 0
                    ? Math.round((ocupacion.reservasConfirmadas / (ocupacion.totalEspacios * ocupacion.diasPeriodo)) * 100)
                    : 0;

                const crecimientoMensual = crecimiento.ingresosMesAnterior > 0
                    ? ((crecimiento.ingresosMesActual - crecimiento.ingresosMesAnterior) / crecimiento.ingresosMesAnterior * 100).toFixed(1)
                    : 0;

                const estadisticasGenerales = {
                    totalIngresos: parseFloat(stats.totalIngresos),
                    totalReservas: parseInt(stats.totalReservas),
                    promedioReservaMes: parseFloat(stats.promedioReservaMes),
                    promedioIngresoReserva: parseFloat(stats.promedioIngresoReserva),
                    tasaOcupacion: tasaOcupacion,
                    crecimientoMensual: parseFloat(crecimientoMensual),
                    clientesActivos: parseInt(stats.clientesActivos),
                    serviciosContratados: parseInt(stats.serviciosContratados)
                };

                console.log('Estadísticas generales obtenidas:', estadisticasGenerales);
                res.status(200).json(estadisticasGenerales);
            });
        });
    });
});

// Endpoint para obtener ventas por mes
app.get('/api/reportes/ventas-por-mes', (req, res) => {
    console.log('Endpoint /api/reportes/ventas-por-mes llamado');

    const { desde, hasta } = req.query;
    const fechaDesde = desde || '2025-01-01';
    const fechaHasta = hasta || new Date().toISOString().split('T')[0];

    const ventasQuery = `
        SELECT 
            DATE_FORMAT(r.fecha_reserva, '%M %Y') as mes,
            YEAR(r.fecha_reserva) as año,
            MONTH(r.fecha_reserva) as mes_num,
            COUNT(r.id) as reservas,
            COALESCE(SUM(p.abono), 0) as ingresos
        FROM reserva r
        LEFT JOIN pago p ON r.id = p.reserva_id
        WHERE DATE(r.fecha_reserva) BETWEEN ? AND ?
        GROUP BY YEAR(r.fecha_reserva), MONTH(r.fecha_reserva)
        ORDER BY YEAR(r.fecha_reserva), MONTH(r.fecha_reserva)
    `;

    connection.query(ventasQuery, [fechaDesde, fechaHasta], (err, results) => {
        if (err) {
            console.error('Error al obtener ventas por mes:', err);
            return res.status(500).json({ error: 'Error al obtener ventas por mes' });
        }

        const ventasPorMes = results.map(row => ({
            mes: row.mes,
            reservas: parseInt(row.reservas),
            ingresos: parseFloat(row.ingresos)
        }));

        console.log('Ventas por mes obtenidas:', ventasPorMes.length);
        res.status(200).json(ventasPorMes);
    });
});

// Endpoint para obtener espacios más reservados
app.get('/api/reportes/espacios-mas-reservados', (req, res) => {
    console.log('Endpoint /api/reportes/espacios-mas-reservados llamado');

    const { desde, hasta } = req.query;
    const fechaDesde = desde || '2025-01-01';
    const fechaHasta = hasta || new Date().toISOString().split('T')[0];

    const espaciosQuery = `
        SELECT 
            e.nombre,
            COUNT(r.id) as reservas,
            COALESCE(SUM(p.abono), 0) as ingresos,
            ROUND(
                (COUNT(r.id) * 100.0 / NULLIF(
                    (SELECT COUNT(*) FROM reserva WHERE DATE(fecha_reserva) BETWEEN ? AND ?), 0
                )), 1
            ) as ocupacion
        FROM espacio e
        LEFT JOIN reserva r ON e.id = r.espacio_id 
            AND DATE(r.fecha_reserva) BETWEEN ? AND ?
        LEFT JOIN pago p ON r.id = p.reserva_id
        GROUP BY e.id, e.nombre
        ORDER BY reservas DESC, ingresos DESC
        LIMIT 10
    `;

    connection.query(espaciosQuery, [fechaDesde, fechaHasta, fechaDesde, fechaHasta], (err, results) => {
        if (err) {
            console.error('Error al obtener espacios más reservados:', err);
            return res.status(500).json({ error: 'Error al obtener espacios más reservados' });
        }

        const espaciosMasReservados = results.map(row => ({
            nombre: row.nombre,
            reservas: parseInt(row.reservas),
            ingresos: parseFloat(row.ingresos),
            ocupacion: parseFloat(row.ocupacion) || 0
        }));

        console.log('Espacios más reservados obtenidos:', espaciosMasReservados.length);
        res.status(200).json(espaciosMasReservados);
    });
});

// Endpoint para obtener servicios más contratados
app.get('/api/reportes/servicios-mas-contratados', (req, res) => {
    console.log('Endpoint /api/reportes/servicios-mas-contratados llamado');

    const { desde, hasta } = req.query;
    const fechaDesde = desde || '2025-01-01';
    const fechaHasta = hasta || new Date().toISOString().split('T')[0];

    const serviciosQuery = `
        SELECT 
            s.nombre,
            COUNT(rs.servicio_id) as contrataciones,
            COALESCE(SUM(s.costo), 0) as ingresos
        FROM servicio s
        LEFT JOIN reserva_servicio rs ON s.id = rs.servicio_id
        LEFT JOIN reserva r ON rs.reserva_id = r.id
            AND DATE(r.fecha_reserva) BETWEEN ? AND ?
        GROUP BY s.id, s.nombre
        HAVING contrataciones > 0
        ORDER BY contrataciones DESC, ingresos DESC
        LIMIT 10
    `;

    connection.query(serviciosQuery, [fechaDesde, fechaHasta], (err, results) => {
        if (err) {
            console.error('Error al obtener servicios más contratados:', err);
            return res.status(500).json({ error: 'Error al obtener servicios más contratados' });
        }

        const serviciosMasContratados = results.map(row => ({
            nombre: row.nombre,
            contrataciones: parseInt(row.contrataciones),
            ingresos: parseFloat(row.ingresos)
        }));

        console.log('Servicios más contratados obtenidos:', serviciosMasContratados.length);
        res.status(200).json(serviciosMasContratados);
    });
});

// Endpoint para obtener clientes top por ingresos
app.get('/api/reportes/clientes-top-ingresos', (req, res) => {
    console.log('Endpoint /api/reportes/clientes-top-ingresos llamado');

    const { desde, hasta } = req.query;
    const fechaDesde = desde || '2025-01-01';
    const fechaHasta = hasta || new Date().toISOString().split('T')[0];

    const clientesQuery = `
        SELECT 
            c.nombre,
            COUNT(r.id) as reservas,
            COALESCE(SUM(p.abono), 0) as ingresos,
            MAX(DATE(r.fecha_reserva)) as ultimaReserva
        FROM cliente c
        LEFT JOIN reserva r ON c.id = r.cliente_id
            AND DATE(r.fecha_reserva) BETWEEN ? AND ?
        LEFT JOIN pago p ON r.id = p.reserva_id
        GROUP BY c.id, c.nombre
        HAVING reservas > 0
        ORDER BY ingresos DESC, reservas DESC
        LIMIT 10
    `;

    connection.query(clientesQuery, [fechaDesde, fechaHasta], (err, results) => {
        if (err) {
            console.error('Error al obtener clientes top por ingresos:', err);
            return res.status(500).json({ error: 'Error al obtener clientes top por ingresos' });
        }

        const clientesTopPorIngresos = results.map(row => ({
            nombre: row.nombre,
            reservas: parseInt(row.reservas),
            ingresos: parseFloat(row.ingresos),
            ultimaReserva: row.ultimaReserva
        }));

        console.log('Clientes top por ingresos obtenidos:', clientesTopPorIngresos.length);
        res.status(200).json(clientesTopPorIngresos);
    });
});

// Endpoint consolidado para obtener todos los datos de reportes
app.get('/api/reportes/datos-completos', (req, res) => {
    console.log('Endpoint /api/reportes/datos-completos llamado');

    const { desde, hasta } = req.query;

    // Ejecutar todas las consultas en paralelo
    Promise.all([
        new Promise((resolve, reject) => {
            const url = `http://localhost:3001/api/reportes/estadisticas-generales?desde=${desde}&hasta=${hasta}`;
            fetch(url)
                .then(response => response.json())
                .then(data => resolve({ estadisticasGenerales: data }))
                .catch(reject);
        }),
        new Promise((resolve, reject) => {
            const url = `http://localhost:3001/api/reportes/ventas-por-mes?desde=${desde}&hasta=${hasta}`;
            fetch(url)
                .then(response => response.json())
                .then(data => resolve({ ventasPorMes: data }))
                .catch(reject);
        }),
        new Promise((resolve, reject) => {
            const url = `http://localhost:3001/api/reportes/espacios-mas-reservados?desde=${desde}&hasta=${hasta}`;
            fetch(url)
                .then(response => response.json())
                .then(data => resolve({ espaciosMasReservados: data }))
                .catch(reject);
        }),
        new Promise((resolve, reject) => {
            const url = `http://localhost:3001/api/reportes/servicios-mas-contratados?desde=${desde}&hasta=${hasta}`;
            fetch(url)
                .then(response => response.json())
                .then(data => resolve({ serviciosMasContratados: data }))
                .catch(reject);
        }),
        new Promise((resolve, reject) => {
            const url = `http://localhost:3001/api/reportes/clientes-top-ingresos?desde=${desde}&hasta=${hasta}`;
            fetch(url)
                .then(response => response.json())
                .then(data => resolve({ clientesTopPorIngresos: data }))
                .catch(reject);
        })
    ]).then(results => {
        const reporteCompleto = Object.assign({}, ...results);
        console.log('Datos completos de reportes obtenidos');
        res.status(200).json(reporteCompleto);
    }).catch(error => {
        console.error('Error al obtener datos completos de reportes:', error);
        res.status(500).json({ error: 'Error al obtener datos completos de reportes' });
    });
});

// ===== ENDPOINTS PARA EFORMULARIO (solo test) =====
// Endpoint para crear un espacio (útil si no existen espacios)
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

// Endpoint para crear reservas según la estructura de las tablas cliente y reserva
app.post('/crearReserva', (req, res) => {
    const { nombre, rut, correo, contacto, fecha, horario, personas, razon, espacioId, servicios } = req.body;

    if (!nombre || !rut || !fecha || !personas || !razon || !espacioId) {
        return res.status(400).json({
            error: 'Faltan campos obligatorios: nombre, rut, fecha, personas, razon y espacioId son requeridos'
        });
    }

    // Verificar si el cliente ya existe
    connection.query('SELECT id FROM cliente WHERE rut = ?', [rut], (err, clienteResults) => {
        if (err) {
            console.error('Error verificando cliente:', err);
            return res.status(500).json({
                error: 'Error al verificar cliente',
                details: err.message
            });
        }

        let clienteId;

        const crearReservaFinal = (clienteId) => {
            // Verificar que el espacio existe
            connection.query('SELECT id FROM espacio WHERE id = ?', [espacioId], (err, espacioResults) => {
                if (err) {
                    console.error('Error verificando espacio:', err);
                    return res.status(500).json({
                        error: 'Error al verificar espacio',
                        details: err.message
                    });
                }

                if (espacioResults.length === 0) {
                    return res.status(400).json({
                        error: `No existe un espacio con ID ${espacioId}`
                    });
                }

                // Combinar fecha y horario para crear fecha_reserva
                const fechaReserva = `${fecha} ${horario || '12:00'}:00`;

                // Crear la reserva
                const reservaQuery = `
                    INSERT INTO reserva (fecha_reserva, estado, cantidad_personas, razon, cliente_id, espacio_id) 
                    VALUES (?, 'pendiente', ?, ?, ?, ?)
                `;

                connection.query(reservaQuery, [fechaReserva, personas, razon, clienteId, espacioId], (err, reservaResult) => {
                    if (err) {
                        console.error('Error creando reserva:', err);
                        return res.status(500).json({
                            error: 'Error al crear la reserva',
                            details: err.message
                        });
                    }

                    const reservaId = reservaResult.insertId;
                    console.log('Reserva creada con ID:', reservaId);

                    // Si hay servicios seleccionados, agregarlos a la reserva
                    if (servicios && servicios.length > 0) {
                        const serviciosPromises = servicios.map(servicioId => {
                            return new Promise((resolve, reject) => {
                                // Verificar que el servicio existe
                                connection.query('SELECT id FROM servicio WHERE id = ?', [servicioId], (err, servicioResults) => {
                                    if (err) {
                                        console.error('Error verificando servicio:', err);
                                        reject(err);
                                        return;
                                    }

                                    if (servicioResults.length === 0) {
                                        console.warn(`Servicio con ID ${servicioId} no existe, se omite`);
                                        resolve();
                                        return;
                                    }

                                    // Insertar en reserva_servicio
                                    connection.query(
                                        'INSERT INTO reserva_servicio (reserva_id, servicio_id) VALUES (?, ?)',
                                        [reservaId, servicioId],
                                        (err, result) => {
                                            if (err) {
                                                console.error('Error agregando servicio a reserva:', err);
                                                reject(err);
                                            } else {
                                                console.log(`Servicio ${servicioId} agregado a reserva ${reservaId}`);
                                                resolve();
                                            }
                                        }
                                    );
                                });
                            });
                        });

                        Promise.all(serviciosPromises)
                            .then(() => {
                                res.status(201).json({
                                    message: 'Reserva creada correctamente con servicios',
                                    reservaId: reservaId,
                                    clienteId: clienteId,
                                    serviciosAgregados: servicios.length
                                });
                            })
                            .catch(error => {
                                console.error('Error agregando servicios:', error);
                                // La reserva ya fue creada, solo falló agregar algunos servicios
                                res.status(201).json({
                                    message: 'Reserva creada, pero algunos servicios no pudieron agregarse',
                                    reservaId: reservaId,
                                    clienteId: clienteId,
                                    warning: 'Algunos servicios no se pudieron agregar'
                                });
                            });
                    } else {
                        // Sin servicios, respuesta normal
                        res.status(201).json({
                            message: 'Reserva creada correctamente',
                            reservaId: reservaId,
                            clienteId: clienteId
                        });
                    }
                });
            });
        };

        if (clienteResults.length > 0) {
            // Cliente ya existe
            clienteId = clienteResults[0].id;
            console.log('Cliente existente encontrado:', clienteId);
            crearReservaFinal(clienteId);
        } else {
            // Crear nuevo cliente
            const clienteQuery = 'INSERT INTO cliente (nombre, rut, correo, telefono) VALUES (?, ?, ?, ?)';
            connection.query(clienteQuery, [nombre, rut, correo, contacto], (err, clienteResult) => {
                if (err) {
                    console.error('Error creando cliente:', err);
                    return res.status(500).json({
                        error: 'Error al crear cliente',
                        details: err.message
                    });
                }

                clienteId = clienteResult.insertId;
                console.log('Nuevo cliente creado con ID:', clienteId);
                crearReservaFinal(clienteId);
            });
        }
    });
});


// Puerto diferente al del cliente React
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});