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

    // Validar que la fecha no sea pasada o sea hoy
    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaReserva.setHours(0, 0, 0, 0);

    if (fechaReserva <= hoy) {
        return res.status(400).json({
            error: 'Solo se pueden hacer reservas para fechas futuras (a partir de mañana)'
        });
    }

    // Verificar si ya existe una reserva para esa fecha y espacio
    const queryVerificarDisponibilidad = `
        SELECT id FROM reserva 
        WHERE espacio_id = ? 
        AND DATE(fecha_reserva) = ? 
        AND estado != 'cancelada'
        LIMIT 1
    `;

    connection.query(queryVerificarDisponibilidad, [espacioId, fecha], (err, existeReserva) => {
        if (err) {
            console.error('Error al verificar disponibilidad:', err);
            return res.status(500).json({ error: 'Error al verificar disponibilidad' });
        }

        if (existeReserva.length > 0) {
            return res.status(400).json({
                error: 'Esta fecha ya está ocupada para el espacio seleccionado'
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
            COALESCE(servicios_concat.serviciosIds, '') as serviciosIds,
            COALESCE(servicios_concat.serviciosNombres, '') as serviciosNombres,
            COALESCE(servicios_concat.serviciosCostos, '') as serviciosCostos,
            COALESCE(servicios_concat.totalServicios, 0) as totalServicios,
            (e.costo_base + COALESCE(servicios_concat.totalServicios, 0)) as costoTotal,
            COALESCE(pagos.total_pagado, 0) as totalPagado,
            (e.costo_base + COALESCE(servicios_concat.totalServicios, 0) - COALESCE(pagos.total_pagado, 0)) as saldoPendiente
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        LEFT JOIN (
            SELECT 
                rs.reserva_id,
                GROUP_CONCAT(DISTINCT s.id) as serviciosIds,
                GROUP_CONCAT(DISTINCT s.nombre) as serviciosNombres,
                GROUP_CONCAT(DISTINCT s.costo) as serviciosCostos,
                SUM(DISTINCT s.costo) as totalServicios
            FROM reserva_servicio rs
            JOIN servicio s ON rs.servicio_id = s.id
            GROUP BY rs.reserva_id
        ) servicios_concat ON r.id = servicios_concat.reserva_id
        LEFT JOIN (
            SELECT reserva_id, SUM(abono) as total_pagado
            FROM pago
            GROUP BY reserva_id
        ) pagos ON r.id = pagos.reserva_id
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
                serviciosSeleccionados: serviciosSeleccionados,
                serviciosNombres: reserva.serviciosNombres ? reserva.serviciosNombres.split(',') : [],
                estado: reserva.estado,
                costoTotal: parseFloat(reserva.costoTotal),
                totalPagado: parseFloat(reserva.totalPagado),
                saldoPendiente: parseFloat(reserva.saldoPendiente),
                fechaCreacion: reserva.fecha_creacion
            };
        });

        console.log(`Reservas obtenidas: ${reservasFormateadas.length}`);
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

// Endpoint para buscar reservas por RUT del cliente (para el chatbot, esto hay que moverlo a su propio archivo)
router.get('/reservas/cliente/:rut', (req, res) => {
    console.log('Endpoint GET /api/reservas/cliente/:rut llamado');
    const { rut } = req.params;

    if (!rut) {
        return res.status(400).json({ error: 'RUT es requerido' });
    }

    const query = `
        SELECT 
            r.id,
            r.fecha_reserva,
            r.cantidad_personas as numero_personas,
            r.razon as tipo_evento,
            r.estado,
            e.nombre as espacio_nombre,
            c.nombre as cliente_nombre,
            c.rut as cliente_rut
        FROM reserva r
        JOIN cliente c ON r.cliente_id = c.id
        JOIN espacio e ON r.espacio_id = e.id
        WHERE c.rut = ? 
        AND r.estado IN ('pendiente', 'confirmada')
        AND DATE(r.fecha_reserva) >= CURDATE()
        ORDER BY r.fecha_reserva ASC
    `;

    connection.query(query, [rut], (err, results) => {
        if (err) {
            console.error('Error al buscar reservas por RUT:', err);
            return res.status(500).json({ error: 'Error al buscar reservas' });
        }

        console.log(`Encontradas ${results.length} reservas para RUT: ${rut}`);
        res.status(200).json(results);
    });
});

// Endpoint específico para modificar fecha y hora de una reserva (para chatbot)
router.put('/reservas/:id/fecha-hora', (req, res) => {
    console.log('Endpoint PUT /api/reservas/:id/fecha-hora llamado');
    const { id } = req.params;
    const { fecha_reserva, hora_inicio } = req.body;

    if (!fecha_reserva || !hora_inicio) {
        return res.status(400).json({
            error: 'Fecha de reserva y hora de inicio son requeridas'
        });
    }

    // Validar que la fecha no sea pasada
    const fechaReserva = new Date(fecha_reserva);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaReserva.setHours(0, 0, 0, 0);

    if (fechaReserva <= hoy) {
        return res.status(400).json({
            error: 'Solo se pueden modificar reservas para fechas futuras'
        });
    }

    // Verificar que la reserva existe y está activa
    const queryVerificar = `
        SELECT r.*, e.nombre as espacio_nombre 
        FROM reserva r 
        JOIN espacio e ON r.espacio_id = e.id
        WHERE r.id = ? AND r.estado IN ('pendiente', 'confirmada', 'pagada')
    `;

    connection.query(queryVerificar, [id], (err, reservaExistente) => {
        if (err) {
            console.error('Error al verificar reserva:', err);
            return res.status(500).json({ error: 'Error al verificar reserva' });
        }

        if (reservaExistente.length === 0) {
            return res.status(404).json({
                error: 'Reserva no encontrada o no se puede modificar'
            });
        }

        // Verificar disponibilidad en la nueva fecha y espacio
        const queryDisponibilidad = `
            SELECT id FROM reserva 
            WHERE espacio_id = ? 
            AND DATE(fecha_reserva) = ? 
            AND estado != 'cancelada'
            AND id != ?
            LIMIT 1
        `;

        connection.query(queryDisponibilidad, [
            reservaExistente[0].espacio_id,
            fecha_reserva,
            id
        ], (err, conflicto) => {
            if (err) {
                console.error('Error al verificar disponibilidad:', err);
                return res.status(500).json({ error: 'Error al verificar disponibilidad' });
            }

            if (conflicto.length > 0) {
                return res.status(400).json({
                    error: 'La fecha seleccionada ya está ocupada para este espacio'
                });
            }

            // Actualizar la reserva
            const fechaHoraCompleta = `${fecha_reserva} ${hora_inicio}:00`;
            const queryActualizar = `
                UPDATE reserva 
                SET fecha_reserva = ?
                WHERE id = ?
            `;

            connection.query(queryActualizar, [fechaHoraCompleta, id], (err, result) => {
                if (err) {
                    console.error('Error al actualizar reserva:', err);
                    return res.status(500).json({ error: 'Error al actualizar reserva' });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'No se pudo actualizar la reserva' });
                }

                console.log(`Reserva ${id} modificada - Nueva fecha: ${fechaHoraCompleta}`);
                res.status(200).json({
                    success: true,
                    message: 'Reserva modificada exitosamente',
                    nuevaFecha: fecha_reserva,
                    nuevaHora: hora_inicio
                });
            });
        });
    });
});

// Endpoint para consultar disponibilidad desde chatbot (esto despues debe moverse a su archivo propio)
router.get('/api/consultar-disponibilidad', (req, res) => {
    console.log('Consulta de disponibilidad desde chatbot');
    console.log('Query params:', req.query);

    const { fecha, espacio, personas } = req.query;

    // Verificar parámetros requeridos
    if (!fecha) {
        return res.status(400).json({
            error: 'La fecha es requerida para consultar disponibilidad'
        });
    }

    // Si no se especifica espacio, consultar disponibilidad general
    let queryDisponibilidad;
    let queryParams;

    if (espacio) {
        // Buscar espacio específico (por nombre)
        const queryBuscarEspacio = `
            SELECT id, nombre FROM espacio 
            WHERE LOWER(nombre) LIKE LOWER(?) 
            AND activo = 1
            LIMIT 1
        `;

        connection.query(queryBuscarEspacio, [`%${espacio}%`], (err, espaciosEncontrados) => {
            if (err) {
                console.error('Error al buscar espacio:', err);
                return res.status(500).json({ error: 'Error al buscar espacio' });
            }

            if (espaciosEncontrados.length === 0) {
                return res.status(404).json({
                    error: `No se encontró el espacio "${espacio}". Espacios disponibles: consulta nuestros espacios disponibles.`
                });
            }

            const espacioEncontrado = espaciosEncontrados[0];

            // Verificar disponibilidad para el espacio específico
            const queryVerificarEspacio = `
                SELECT r.id, e.nombre as espacio_nombre
                FROM reserva r
                JOIN espacio e ON r.espacio_id = e.id
                WHERE r.espacio_id = ? 
                AND DATE(r.fecha_reserva) = ? 
                AND r.estado != 'cancelada'
            `;

            connection.query(queryVerificarEspacio, [espacioEncontrado.id, fecha], (err, reservasExistentes) => {
                if (err) {
                    console.error('Error al verificar disponibilidad:', err);
                    return res.status(500).json({ error: 'Error al verificar disponibilidad' });
                }

                const disponible = reservasExistentes.length === 0;

                res.json({
                    disponible,
                    fecha,
                    espacio: espacioEncontrado.nombre,
                    espacioId: espacioEncontrado.id,
                    personas: personas || 'No especificado',
                    mensaje: disponible
                        ? `✅ ¡Excelente! El espacio "${espacioEncontrado.nombre}" está disponible para el ${fecha}.`
                        : `❌ Lo siento, el espacio "${espacioEncontrado.nombre}" ya está ocupado para el ${fecha}.`
                });
            });
        });
    } else {
        // Consultar disponibilidad general de todos los espacios
        const queryDisponibilidadGeneral = `
            SELECT e.id, e.nombre, e.descripcion,
                   CASE 
                       WHEN r.id IS NULL THEN 1 
                       ELSE 0 
                   END as disponible
            FROM espacio e
            LEFT JOIN (
                SELECT espacio_id, id
                FROM reserva 
                WHERE DATE(fecha_reserva) = ? 
                AND estado != 'cancelada'
            ) r ON e.id = r.espacio_id
            WHERE e.activo = 1
            ORDER BY e.nombre
        `;

        connection.query(queryDisponibilidadGeneral, [fecha], (err, resultados) => {
            if (err) {
                console.error('Error al consultar disponibilidad general:', err);
                return res.status(500).json({ error: 'Error al consultar disponibilidad' });
            }

            const espaciosDisponibles = resultados.filter(e => e.disponible === 1);
            const espaciosOcupados = resultados.filter(e => e.disponible === 0);

            res.json({
                fecha,
                personas: personas || 'No especificado',
                espaciosDisponibles,
                espaciosOcupados,
                mensaje: espaciosDisponibles.length > 0
                    ? `✅ Para el ${fecha} tenemos ${espaciosDisponibles.length} espacio(s) disponible(s).`
                    : `❌ Lo siento, no hay espacios disponibles para el ${fecha}.`
            });
        });
    }
});

// Endpoint específico para consultas de disponibilidad desde el chatbot
router.post('/api/chatbot/consultar-disponibilidad', (req, res) => {
    console.log('Consulta de disponibilidad desde chatbot:', req.body);

    const { fecha, espacio, personas } = req.body;

    // Construir respuesta
    let respuesta = {
        disponible: null,
        mensaje: '',
        espacios: [],
        sugerencias: []
    };

    // Si no hay fecha específica, obtener todos los espacios
    if (!fecha) {
        const queryEspacios = `
            SELECT id, nombre, capacidad, costo_base, descripcion 
            FROM espacio 
            WHERE disponible = 1 
            ORDER BY capacidad ASC
        `;

        connection.query(queryEspacios, (err, espacios) => {
            if (err) {
                console.error('Error al obtener espacios:', err);
                return res.status(500).json({ error: 'Error al obtener espacios' });
            }

            respuesta.espacios = espacios;
            respuesta.mensaje = `Tenemos ${espacios.length} espacios disponibles. Para consultar disponibilidad específica, necesito que me indiques la fecha.`;

            return res.json(respuesta);
        });
        return;
    }

    // Validar fecha
    const fechaConsulta = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaConsulta.setHours(0, 0, 0, 0);

    if (fechaConsulta <= hoy) {
        respuesta.disponible = false;
        respuesta.mensaje = 'Solo puedo consultar disponibilidad para fechas futuras (a partir de mañana).';
        return res.json(respuesta);
    }

    // Si hay espacio específico, verificar su disponibilidad
    if (espacio) {
        // Buscar el espacio por nombre (flexible)
        const queryBuscarEspacio = `
            SELECT id, nombre, capacidad, costo_base, descripcion 
            FROM espacio 
            WHERE LOWER(nombre) LIKE LOWER(?) 
            AND disponible = 1 
            LIMIT 1
        `;

        connection.query(queryBuscarEspacio, [`%${espacio}%`], (err, espacioEncontrado) => {
            if (err) {
                console.error('Error al buscar espacio:', err);
                return res.status(500).json({ error: 'Error al buscar espacio' });
            }

            if (espacioEncontrado.length === 0) {
                // El espacio no existe, listar espacios disponibles
                const queryEspacios = `
                    SELECT id, nombre, capacidad, costo_base, descripcion 
                    FROM espacio 
                    WHERE disponible = 1 
                    ORDER BY capacidad ASC
                `;

                connection.query(queryEspacios, (err, espacios) => {
                    if (err) {
                        console.error('Error al obtener espacios:', err);
                        return res.status(500).json({ error: 'Error al obtener espacios' });
                    }

                    respuesta.disponible = false;
                    respuesta.mensaje = `No encontré un espacio llamado "${espacio}". Estos son nuestros espacios disponibles:`;
                    respuesta.espacios = espacios;

                    return res.json(respuesta);
                });
                return;
            }

            const espacioInfo = espacioEncontrado[0];

            // Verificar si hay capacidad suficiente
            if (personas && personas > espacioInfo.capacidad) {
                respuesta.disponible = false;
                respuesta.mensaje = `El ${espacioInfo.nombre} tiene capacidad para ${espacioInfo.capacidad} personas, pero solicitas para ${personas} personas.`;

                // Sugerir espacios con mayor capacidad
                const querySugerencias = `
                    SELECT id, nombre, capacidad, costo_base 
                    FROM espacio 
                    WHERE capacidad >= ? 
                    AND disponible = 1 
                    ORDER BY capacidad ASC
                `;

                connection.query(querySugerencias, [personas], (err, sugerencias) => {
                    if (err) {
                        console.error('Error al obtener sugerencias:', err);
                        return res.json(respuesta);
                    }

                    if (sugerencias.length > 0) {
                        respuesta.mensaje += ` Te sugiero estos espacios con mayor capacidad:`;
                        respuesta.sugerencias = sugerencias;
                    } else {
                        respuesta.mensaje += ` Lamentablemente ninguno de nuestros espacios tiene capacidad para ${personas} personas.`;
                    }

                    return res.json(respuesta);
                });
                return;
            }

            // Verificar disponibilidad para la fecha específica
            const queryDisponibilidad = `
                SELECT id FROM reserva 
                WHERE espacio_id = ? 
                AND DATE(fecha_reserva) = ? 
                AND estado != 'cancelada'
                LIMIT 1
            `;

            connection.query(queryDisponibilidad, [espacioInfo.id, fecha], (err, reservaExistente) => {
                if (err) {
                    console.error('Error al verificar disponibilidad:', err);
                    return res.status(500).json({ error: 'Error al verificar disponibilidad' });
                }

                if (reservaExistente.length > 0) {
                    respuesta.disponible = false;
                    respuesta.mensaje = `❌ El ${espacioInfo.nombre} NO está disponible para el ${fecha}.`;
                } else {
                    respuesta.disponible = true;
                    respuesta.mensaje = `✅ ¡Excelente! El ${espacioInfo.nombre} SÍ está disponible para el ${fecha}.`;

                    if (personas) {
                        respuesta.mensaje += `\n\n📊 Capacidad: ${espacioInfo.capacidad} personas (solicitas: ${personas})`;
                    }
                    respuesta.mensaje += `\n💰 Costo base: $${espacioInfo.costo_base.toLocaleString('es-CL')}`;
                    respuesta.mensaje += `\n📝 ${espacioInfo.descripcion}`;
                    respuesta.mensaje += `\n\n¿Te gustaría hacer la reserva?`;
                }

                respuesta.espacios = [espacioInfo];
                return res.json(respuesta);
            });
        });
        return;
    }

    // Si solo hay fecha pero no espacio específico, mostrar todos los espacios disponibles para esa fecha
    const queryDisponibilidadGeneral = `
        SELECT e.id, e.nombre, e.capacidad, e.costo_base, e.descripcion,
               CASE 
                   WHEN r.id IS NULL THEN 1 
                   ELSE 0 
               END as disponible_fecha
        FROM espacio e
        LEFT JOIN reserva r ON e.id = r.espacio_id 
            AND DATE(r.fecha_reserva) = ? 
            AND r.estado != 'cancelada'
        WHERE e.disponible = 1
        ORDER BY e.capacidad ASC
    `;

    connection.query(queryDisponibilidadGeneral, [fecha], (err, espacios) => {
        if (err) {
            console.error('Error al consultar disponibilidad general:', err);
            return res.status(500).json({ error: 'Error al consultar disponibilidad' });
        }

        const espaciosDisponibles = espacios.filter(e => e.disponible_fecha === 1);
        const espaciosOcupados = espacios.filter(e => e.disponible_fecha === 0);

        if (espaciosDisponibles.length === 0) {
            respuesta.disponible = false;
            respuesta.mensaje = `❌ Lo siento, no hay espacios disponibles para el ${fecha}.`;
        } else {
            respuesta.disponible = true;
            respuesta.mensaje = `📅 Para el ${fecha} tenemos ${espaciosDisponibles.length} espacios disponibles:`;

            if (personas) {
                const espaciosConCapacidad = espaciosDisponibles.filter(e => e.capacidad >= personas);
                if (espaciosConCapacidad.length > 0) {
                    respuesta.mensaje += `\n\n✅ Espacios con capacidad para ${personas} personas:`;
                    respuesta.espacios = espaciosConCapacidad;
                } else {
                    respuesta.mensaje += `\n\n⚠️ Ningún espacio disponible tiene capacidad para ${personas} personas.`;
                    respuesta.espacios = espaciosDisponibles;
                }
            } else {
                respuesta.espacios = espaciosDisponibles;
            }
        }

        return res.json(respuesta);
    });
});

module.exports = router;