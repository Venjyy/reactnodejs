const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Endpoint específico para reservas desde el formulario público
router.post('/api/reservas-publicas', (req, res) => {
    console.log('Endpoint POST /api/reservas-publicas llamado desde formulario público');
    console.log('Datos recibidos:', req.body);

    const { nombre, rut, correo, contacto, fecha, horario, personas, razon, espacioId, servicios } = req.body;

    if (!nombre || !rut || !fecha || !personas || !razon || !espacioId) {
        return res.status(400).json({
            error: 'Datos requeridos: nombre, rut, fecha, personas, razon, espacioId'
        });
    }

    // Verificar si el cliente ya existe
    connection.query('SELECT id FROM cliente WHERE rut = ?', [rut], (err, clienteResults) => {
        if (err) {
            console.error('Error al verificar cliente:', err);
            return res.status(500).json({ error: 'Error al verificar cliente' });
        }

        let clienteId;

        const crearReserva = (clienteId) => {
            // Crear la reserva
            const fechaHoraReserva = `${fecha} ${horario || '00:00:00'}`;
            const queryReserva = `
                INSERT INTO reserva (cliente_id, espacio_id, fecha_reserva, cantidad_personas, razon, estado)
                VALUES (?, ?, ?, ?, ?, 'pendiente')
            `;

            connection.query(queryReserva, [clienteId, espacioId, fechaHoraReserva, personas, razon], (err, resultReserva) => {
                if (err) {
                    console.error('Error al crear reserva:', err);
                    return res.status(500).json({ error: 'Error al crear la reserva' });
                }

                const reservaId = resultReserva.insertId;

                // Agregar servicios si los hay
                if (servicios && servicios.length > 0) {
                    const serviciosPromises = servicios.map(servicioId => {
                        return new Promise((resolve, reject) => {
                            const queryServicio = 'INSERT INTO reserva_servicio (reserva_id, servicio_id) VALUES (?, ?)';
                            connection.query(queryServicio, [reservaId, servicioId], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                    });

                    Promise.all(serviciosPromises)
                        .then(() => {
                            console.log('Reserva pública creada con ID:', reservaId);
                            res.status(201).json({
                                message: 'Reserva creada correctamente',
                                reservaId: reservaId,
                                estado: 'pendiente'
                            });
                        })
                        .catch(err => {
                            console.error('Error al agregar servicios:', err);
                            res.status(500).json({ error: 'Error al agregar servicios a la reserva' });
                        });
                } else {
                    console.log('Reserva pública creada con ID:', reservaId);
                    res.status(201).json({
                        message: 'Reserva creada correctamente',
                        reservaId: reservaId,
                        estado: 'pendiente'
                    });
                }
            });
        };

        if (clienteResults.length > 0) {
            // El cliente ya existe
            clienteId = clienteResults[0].id;
            crearReserva(clienteId);
        } else {
            // Crear nuevo cliente
            const queryCliente = 'INSERT INTO cliente (nombre, rut, correo, telefono) VALUES (?, ?, ?, ?)';
            connection.query(queryCliente, [nombre, rut, correo || '', contacto || ''], (err, resultCliente) => {
                if (err) {
                    console.error('Error al crear cliente:', err);
                    return res.status(500).json({ error: 'Error al crear cliente' });
                }

                clienteId = resultCliente.insertId;
                crearReserva(clienteId);
            });
        }
    });
});

// Endpoint específico para crear reserva desde dashboard
router.post('/crearReserva', (req, res) => {
    console.log('Endpoint POST /crearReserva llamado desde dashboard');
    console.log('Datos recibidos:', req.body);

    const { clienteId, espacioId, fecha, horario, personas, razon, servicios } = req.body;

    if (!clienteId || !espacioId || !fecha || !horario || !personas || !razon) {
        return res.status(400).json({
            error: 'Todos los campos son requeridos'
        });
    }

    // Verificar que el cliente existe
    connection.query('SELECT id, nombre FROM cliente WHERE id = ?', [clienteId], (err, clienteResults) => {
        if (err) {
            console.error('Error al verificar cliente:', err);
            return res.status(500).json({ error: 'Error al verificar cliente' });
        }

        if (clienteResults.length === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Verificar que el espacio existe y está disponible
        connection.query('SELECT id, nombre, disponible FROM espacio WHERE id = ?', [espacioId], (err, espacioResults) => {
            if (err) {
                console.error('Error al verificar espacio:', err);
                return res.status(500).json({ error: 'Error al verificar espacio' });
            }

            if (espacioResults.length === 0) {
                return res.status(404).json({ error: 'Espacio no encontrado' });
            }

            if (!espacioResults[0].disponible) {
                return res.status(400).json({ error: 'El espacio no está disponible' });
            }

            // Crear la reserva
            const fechaHoraReserva = `${fecha} ${horario}`;
            const queryReserva = `
                INSERT INTO reserva (cliente_id, espacio_id, fecha_reserva, cantidad_personas, razon, estado)
                VALUES (?, ?, ?, ?, ?, 'pendiente')
            `;

            connection.query(queryReserva, [clienteId, espacioId, fechaHoraReserva, personas, razon], (err, resultReserva) => {
                if (err) {
                    console.error('Error al crear reserva:', err);
                    return res.status(500).json({ error: 'Error al crear la reserva' });
                }

                const reservaId = resultReserva.insertId;

                // Agregar servicios si los hay
                if (servicios && servicios.length > 0) {
                    const serviciosPromises = servicios.map(servicioId => {
                        return new Promise((resolve, reject) => {
                            const queryServicio = 'INSERT INTO reserva_servicio (reserva_id, servicio_id) VALUES (?, ?)';
                            connection.query(queryServicio, [reservaId, servicioId], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        });
                    });

                    Promise.all(serviciosPromises)
                        .then(() => {
                            console.log('Reserva creada desde dashboard con ID:', reservaId);
                            res.status(201).json({
                                message: 'Reserva creada correctamente',
                                reservaId: reservaId,
                                cliente: clienteResults[0].nombre,
                                espacio: espacioResults[0].nombre
                            });
                        })
                        .catch(err => {
                            console.error('Error al agregar servicios:', err);
                            res.status(500).json({ error: 'Error al agregar servicios a la reserva' });
                        });
                } else {
                    console.log('Reserva creada desde dashboard con ID:', reservaId);
                    res.status(201).json({
                        message: 'Reserva creada correctamente',
                        reservaId: reservaId,
                        cliente: clienteResults[0].nombre,
                        espacio: espacioResults[0].nombre
                    });
                }
            });
        });
    });
});

// Endpoint para obtener clientes para el dropdown
router.get('/reservas/clientes', (req, res) => {
    console.log('Endpoint /api/reservas/clientes llamado');

    const query = 'SELECT id, nombre, rut FROM cliente ORDER BY nombre';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener clientes:', err);
            return res.status(500).json({ error: 'Error al obtener clientes' });
        }

        res.status(200).json(results);
    });
});

// Endpoint para obtener espacios para el dropdown
router.get('/reservas/espacios', (req, res) => {
    console.log('Endpoint /api/reservas/espacios llamado');

    const query = 'SELECT id, nombre, capacidad, costo_base as costo FROM espacio WHERE disponible = true ORDER BY nombre';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener espacios:', err);
            return res.status(500).json({ error: 'Error al obtener espacios' });
        }

        res.status(200).json(results);
    });
});

// Endpoint para obtener servicios para el dropdown
router.get('/reservas/servicios', (req, res) => {
    console.log('Endpoint /api/reservas/servicios llamado');

    const query = 'SELECT id, nombre, costo as precio FROM servicio ORDER BY nombre';

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener servicios:', err);
            return res.status(500).json({ error: 'Error al obtener servicios' });
        }

        res.status(200).json(results);
    });
});

// Endpoint para crear una nueva reserva
router.post('/reservas', (req, res) => {
    console.log('Endpoint POST /api/reservas llamado');
    console.log('Datos recibidos:', req.body);

    const {
        clienteId,
        espacioId,
        fechaEvento,
        horaInicio,
        horaFin,
        numeroPersonas,
        tipoEvento,
        serviciosSeleccionados,
        estado,
        observaciones
    } = req.body;

    if (!clienteId || !espacioId || !fechaEvento || !horaInicio || !numeroPersonas || !tipoEvento) {
        return res.status(400).json({
            error: 'Los campos clienteId, espacioId, fechaEvento, horaInicio, numeroPersonas y tipoEvento son obligatorios'
        });
    }

    // Combinar fecha y hora para la reserva
    const fechaHoraReserva = `${fechaEvento} ${horaInicio}:00`;

    const queryReserva = `
        INSERT INTO reserva (cliente_id, espacio_id, fecha_reserva, cantidad_personas, razon, estado)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    connection.query(queryReserva, [
        clienteId,
        espacioId,
        fechaHoraReserva,
        numeroPersonas,
        tipoEvento,
        estado || 'pendiente'
    ], (err, result) => {
        if (err) {
            console.error('Error al crear reserva:', err);
            return res.status(500).json({
                error: 'Error al crear reserva',
                details: err.message
            });
        }

        const reservaId = result.insertId;

        // Agregar servicios si los hay
        if (serviciosSeleccionados && serviciosSeleccionados.length > 0) {
            const serviciosPromises = serviciosSeleccionados.map(servicioId => {
                return new Promise((resolve, reject) => {
                    const queryServicio = 'INSERT INTO reserva_servicio (reserva_id, servicio_id) VALUES (?, ?)';
                    connection.query(queryServicio, [reservaId, servicioId], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            });

            Promise.all(serviciosPromises)
                .then(() => {
                    console.log('Reserva creada con ID:', reservaId);
                    res.status(201).json({
                        id: reservaId,
                        message: 'Reserva creada correctamente'
                    });
                })
                .catch(err => {
                    console.error('Error al agregar servicios:', err);
                    res.status(500).json({
                        error: 'Error al agregar servicios a la reserva',
                        details: err.message
                    });
                });
        } else {
            console.log('Reserva creada con ID:', reservaId);
            res.status(201).json({
                id: reservaId,
                message: 'Reserva creada correctamente'
            });
        }
    });
});

// NUEVO ENDPOINT PUT para actualizar reservas
router.put('/reservas/:id', (req, res) => {
    console.log('Endpoint PUT /api/reservas/:id llamado');
    console.log('ID de reserva:', req.params.id);
    console.log('Datos recibidos:', req.body);

    const { id } = req.params;
    const {
        clienteId,
        espacioId,
        fechaEvento,
        horaInicio,
        horaFin,
        numeroPersonas,
        tipoEvento,
        serviciosSeleccionados,
        estado,
        observaciones,
        descuento,
        anticipo
    } = req.body;

    if (!clienteId || !espacioId || !fechaEvento || !horaInicio || !numeroPersonas || !tipoEvento) {
        return res.status(400).json({
            error: 'Los campos clienteId, espacioId, fechaEvento, horaInicio, numeroPersonas y tipoEvento son obligatorios'
        });
    }

    // Combinar fecha y hora para la reserva
    const fechaHoraReserva = `${fechaEvento} ${horaInicio}:00`;

    // Actualizar la reserva principal
    const queryUpdateReserva = `
        UPDATE reserva 
        SET cliente_id = ?, espacio_id = ?, fecha_reserva = ?, cantidad_personas = ?, razon = ?, estado = ?
        WHERE id = ?
    `;

    connection.query(queryUpdateReserva, [
        clienteId,
        espacioId,
        fechaHoraReserva,
        numeroPersonas,
        tipoEvento,
        estado || 'pendiente',
        id
    ], (err, result) => {
        if (err) {
            console.error('Error al actualizar reserva:', err);
            return res.status(500).json({
                error: 'Error al actualizar reserva',
                details: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        // Eliminar servicios existentes
        const deleteServiciosQuery = 'DELETE FROM reserva_servicio WHERE reserva_id = ?';

        connection.query(deleteServiciosQuery, [id], (err) => {
            if (err) {
                console.error('Error al eliminar servicios existentes:', err);
                return res.status(500).json({
                    error: 'Error al actualizar servicios',
                    details: err.message
                });
            }

            // Agregar nuevos servicios si los hay
            if (serviciosSeleccionados && serviciosSeleccionados.length > 0) {
                const serviciosPromises = serviciosSeleccionados.map(servicioId => {
                    return new Promise((resolve, reject) => {
                        const queryServicio = 'INSERT INTO reserva_servicio (reserva_id, servicio_id) VALUES (?, ?)';
                        connection.query(queryServicio, [id, servicioId], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                });

                Promise.all(serviciosPromises)
                    .then(() => {
                        console.log('Reserva actualizada con ID:', id);
                        res.status(200).json({
                            id: id,
                            message: 'Reserva actualizada correctamente'
                        });
                    })
                    .catch(err => {
                        console.error('Error al actualizar servicios:', err);
                        res.status(500).json({
                            error: 'Error al actualizar servicios de la reserva',
                            details: err.message
                        });
                    });
            } else {
                console.log('Reserva actualizada con ID:', id);
                res.status(200).json({
                    id: id,
                    message: 'Reserva actualizada correctamente'
                });
            }
        });
    });
});

// Endpoint específico para obtener reservas para pagos (dashboard)
router.get('/reservas', (req, res) => {
    console.log('Endpoint /api/reservas llamado');

    const query = `
        SELECT 
            r.id,
            r.fecha_reserva,
            r.estado,
            r.cantidad_personas as numeroPersonas,
            r.razon as tipoEvento,
            r.fecha_creacion,
            c.id as clienteId,
            c.nombre as clienteNombre,
            c.rut as clienteRut,
            e.id as espacioId,
            e.nombre as espacioNombre,
            e.costo_base as espacioCosto,
            GROUP_CONCAT(DISTINCT s.id) as serviciosIds,
            GROUP_CONCAT(DISTINCT s.nombre) as serviciosNombres,
            GROUP_CONCAT(DISTINCT s.costo) as serviciosCostos,
            COALESCE(SUM(DISTINCT s.costo), 0) as totalServicios,
            (e.costo_base + COALESCE(SUM(DISTINCT s.costo), 0)) as costoTotal,
            COALESCE(pagos.total_pagado, 0) as totalPagado,
            (e.costo_base + COALESCE(SUM(DISTINCT s.costo), 0) - COALESCE(pagos.total_pagado, 0)) as saldoPendiente
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
            return res.status(500).json({
                error: 'Error al obtener reservas',
                details: err.message
            });
        }

        // Formatear los resultados para el frontend
        const reservasFormateadas = results.map(reserva => {
            // Procesar servicios
            let serviciosSeleccionados = [];
            if (reserva.serviciosIds) {
                const ids = reserva.serviciosIds.split(',').map(id => parseInt(id));
                serviciosSeleccionados = ids;
            }

            // Procesar fecha y hora
            let fechaEvento = '';
            let horaInicio = '';
            let horaFin = '';

            if (reserva.fecha_reserva) {
                const fechaReserva = new Date(reserva.fecha_reserva);

                // Formatear fecha como YYYY-MM-DD para el input date
                fechaEvento = fechaReserva.toISOString().split('T')[0];

                // Extraer hora (formato HH:MM)
                horaInicio = fechaReserva.toTimeString().substring(0, 5);

                // Calcular hora fin (agregar 4 horas por defecto)
                const fechaFin = new Date(fechaReserva.getTime() + 4 * 60 * 60 * 1000);
                horaFin = fechaFin.toTimeString().substring(0, 5);
            }

            return {
                id: reserva.id,
                clienteId: reserva.clienteId,
                clienteNombre: reserva.clienteNombre,
                clienteRut: reserva.clienteRut,
                espacioId: reserva.espacioId,
                espacioNombre: reserva.espacioNombre,
                espacioCosto: parseFloat(reserva.espacioCosto),
                fechaEvento: fechaEvento,
                horaInicio: horaInicio,
                horaFin: horaFin,
                numeroPersonas: reserva.numeroPersonas,
                tipoEvento: reserva.tipoEvento,
                estado: reserva.estado,
                serviciosSeleccionados: serviciosSeleccionados,
                serviciosNombres: reserva.serviciosNombres ? reserva.serviciosNombres.split(',') : [],
                totalServicios: parseFloat(reserva.totalServicios) || 0,
                costoTotal: parseFloat(reserva.costoTotal) || 0,
                totalPagado: parseFloat(reserva.totalPagado) || 0,
                saldoPendiente: parseFloat(reserva.saldoPendiente) || 0,
                anticipo: parseFloat(reserva.totalPagado) || 0,
                descuento: 0, // Por defecto 0, agregar a BD si necesitas
                observaciones: '', // Agregar a BD si necesitas
                fecha_creacion: reserva.fecha_creacion
            };
        });

        console.log('Reservas obtenidas y formateadas:', reservasFormateadas.length);
        res.status(200).json(reservasFormateadas);
    });
});

// Endpoint para cambiar estado de una reserva
router.patch('/reservas/:id/estado', (req, res) => {
    console.log('Endpoint PATCH /api/reservas/:id/estado llamado');

    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
        return res.status(400).json({ error: 'El campo estado es obligatorio' });
    }

    const validStates = ['pendiente', 'confirmada', 'cancelada', 'completada'];
    if (!validStates.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido' });
    }

    const updateQuery = 'UPDATE reserva SET estado = ? WHERE id = ?';

    connection.query(updateQuery, [estado, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar estado:', err);
            return res.status(500).json({ error: 'Error al actualizar estado' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        console.log('Estado actualizado para reserva:', id, 'nuevo estado:', estado);
        res.status(200).json({
            message: 'Estado actualizado correctamente',
            estado: estado
        });
    });
});

// Endpoint para eliminar una reserva
router.delete('/reservas/:id', (req, res) => {
    console.log('Endpoint DELETE /api/reservas llamado');

    const { id } = req.params;

    // Primero eliminar los servicios asociados
    const deleteServiciosQuery = 'DELETE FROM reserva_servicio WHERE reserva_id = ?';

    connection.query(deleteServiciosQuery, [id], (err) => {
        if (err) {
            console.error('Error al eliminar servicios de la reserva:', err);
            return res.status(500).json({ error: 'Error al eliminar servicios de la reserva' });
        }

        // Luego eliminar los pagos asociados
        const deletePagosQuery = 'DELETE FROM pago WHERE reserva_id = ?';

        connection.query(deletePagosQuery, [id], (err) => {
            if (err) {
                console.error('Error al eliminar pagos de la reserva:', err);
                return res.status(500).json({ error: 'Error al eliminar pagos de la reserva' });
            }

            // Finalmente eliminar la reserva
            const deleteReservaQuery = 'DELETE FROM reserva WHERE id = ?';

            connection.query(deleteReservaQuery, [id], (err, result) => {
                if (err) {
                    console.error('Error al eliminar reserva:', err);
                    return res.status(500).json({ error: 'Error al eliminar reserva' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Reserva no encontrada' });
                }

                console.log('Reserva eliminada:', id);
                res.status(200).json({ message: 'Reserva eliminada correctamente' });
            });
        });
    });
});

module.exports = router;