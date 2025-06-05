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
    const { nombre, rut, correo, contacto, fecha, horario, personas, razon, espacioId } = req.body;

    // Validar campos obligatorios
    if (!nombre || !rut || !correo || !contacto || !fecha || !horario || !personas || !razon) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Usar el espacioId proporcionado o el valor por defecto
    const espacioIdFinal = espacioId || 1;

    // Verificar primero si el cliente ya existe por RUT
    const checkClienteQuery = 'SELECT id FROM cliente WHERE rut = ?';

    connection.query(checkClienteQuery, [rut], (err, clienteResults) => {
        if (err) {
            console.error('Error al verificar cliente:', err);
            return res.status(500).json({
                error: 'Error al verificar si el cliente existe',
                details: err.message
            });
        }

        let clienteId;

        // Si el cliente ya existe, usamos su ID
        if (clienteResults.length > 0) {
            clienteId = clienteResults[0].id;
            procederConReserva(clienteId);
        }
        // Si no existe, creamos un nuevo cliente
        else {
            const insertClienteQuery = 'INSERT INTO cliente (nombre, rut, correo, telefono) VALUES (?, ?, ?, ?)';

            connection.query(insertClienteQuery, [nombre, rut, correo, contacto], (err, clienteResult) => {
                if (err) {
                    console.error('Error al crear cliente:', err);
                    return res.status(500).json({
                        error: 'Error al crear el cliente',
                        details: err.message
                    });
                }

                clienteId = clienteResult.insertId;
                procederConReserva(clienteId);
            });
        }

        // Función para insertar la reserva una vez que tenemos el clienteId
        function procederConReserva(clienteId) {
            try {
                // Validación de fecha y formato adecuado para MySQL
                const fechaObj = new Date(`${fecha}T${horario}:00`);
                if (isNaN(fechaObj.getTime())) {
                    return res.status(400).json({
                        error: 'Formato de fecha u hora inválido'
                    });
                }

                // Formatear fecha para MySQL (YYYY-MM-DD HH:MM:SS)
                const fechaFormateada = fechaObj.toISOString().slice(0, 19).replace('T', ' ');

                // Asegurarse que personas sea un número
                const cantidadPersonas = parseInt(personas);

                // Verificar que la conversión a número sea válida
                if (isNaN(cantidadPersonas) || cantidadPersonas <= 0) {
                    return res.status(400).json({
                        error: 'La cantidad de personas debe ser un número positivo'
                    });
                }

                // Primero verificar que el espacio existe
                connection.query('SELECT id, capacidad FROM espacio WHERE id = ?', [espacioIdFinal], (err, espacioResults) => {
                    if (err) {
                        console.error('Error al verificar espacio:', err);
                        return res.status(500).json({
                            error: 'Error al verificar si el espacio existe',
                            details: err.message
                        });
                    }

                    if (espacioResults.length === 0) {
                        return res.status(400).json({
                            error: 'El espacio seleccionado no existe. Debe crear primero el espacio en la base de datos.'
                        });
                    }

                    // Verificar que la capacidad del espacio sea suficiente
                    const capacidadEspacio = espacioResults[0].capacidad;
                    if (cantidadPersonas > capacidadEspacio) {
                        return res.status(400).json({
                            error: `El espacio seleccionado solo tiene capacidad para ${capacidadEspacio} personas.`
                        });
                    }

                    // Verificar si ya existe una reserva para esa fecha y hora en ese espacio
                    const checkReservaQuery =
                        'SELECT id FROM reserva WHERE fecha_reserva = ? AND espacio_id = ? AND estado != "cancelada"';

                    connection.query(checkReservaQuery, [fechaFormateada, espacioIdFinal], (err, reservaResults) => {
                        if (err) {
                            console.error('Error al verificar disponibilidad:', err);
                            return res.status(500).json({
                                error: 'Error al verificar disponibilidad',
                                details: err.message
                            });
                        }

                        if (reservaResults.length > 0) {
                            return res.status(409).json({
                                error: 'Ya existe una reserva para esa fecha y hora en el espacio seleccionado.'
                            });
                        }

                        // Ahora insertar en la tabla reserva
                        const reservaQuery =
                            'INSERT INTO reserva (fecha_reserva, estado, cantidad_personas, razon, cliente_id, espacio_id) VALUES (?, ?, ?, ?, ?, ?)';

                        console.log('Intentando crear reserva con los valores:');
                        console.log('fecha_reserva:', fechaFormateada);
                        console.log('estado: pendiente');
                        console.log('cantidad_personas:', cantidadPersonas);
                        console.log('razon:', razon);
                        console.log('cliente_id:', clienteId);
                        console.log('espacio_id:', espacioIdFinal);

                        connection.query(reservaQuery,
                            [fechaFormateada, 'pendiente', cantidadPersonas, razon, clienteId, espacioIdFinal],
                            (err, reservaResult) => {
                                if (err) {
                                    console.error('Error al crear reserva:', err);
                                    return res.status(500).json({
                                        error: 'Error al crear la reserva',
                                        sqlMessage: err.sqlMessage,
                                        sqlCode: err.code,
                                        details: err.message
                                    });
                                }

                                res.status(201).json({
                                    message: '¡Reserva creada correctamente!',
                                    clienteId: clienteId,
                                    reservaId: reservaResult.insertId
                                });
                            }
                        );
                    });
                });
            } catch (error) {
                console.error('Error en el procesamiento de la reserva:', error);
                return res.status(500).json({
                    error: 'Error interno al procesar la reserva',
                    details: error.message
                });
            }
        }
    });
});


// Puerto diferente al del cliente React
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});