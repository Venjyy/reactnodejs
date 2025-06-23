const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Endpoint para obtener todos los servicios
router.get('/servicios', (req, res) => {
    console.log('Endpoint /api/servicios llamado');

    const query = `
        SELECT 
            s.id,
            s.nombre,
            s.descripcion,
            s.categoria,
            s.costo as precio,
            s.disponible,
            s.proveedor_externo as proveedorExterno,
            s.tiempo_preparacion as tiempoPreparacion,
            s.observaciones,
            s.fecha_creacion,
            COUNT(rs.reserva_id) as reservasActivas
        FROM servicio s
        LEFT JOIN reserva_servicio rs ON s.id = rs.servicio_id
        LEFT JOIN reserva r ON rs.reserva_id = r.id AND r.estado IN ('pendiente', 'confirmada')
        GROUP BY s.id, s.nombre, s.descripcion, s.categoria, s.costo, s.disponible, 
                 s.proveedor_externo, s.tiempo_preparacion, s.observaciones, s.fecha_creacion
        ORDER BY s.nombre
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener servicios:', err);
            return res.status(500).json({
                error: 'Error al obtener servicios',
                details: err.message
            });
        }

        // Mapear los resultados
        const serviciosFormateados = results.map(servicio => ({
            id: servicio.id,
            nombre: servicio.nombre,
            precio: parseFloat(servicio.precio),
            descripcion: servicio.descripcion || `Servicio de ${servicio.nombre}`,
            categoria: servicio.categoria || 'Otros',
            disponible: Boolean(servicio.disponible),
            proveedorExterno: Boolean(servicio.proveedorExterno),
            tiempoPreparacion: servicio.tiempoPreparacion || '1 día',
            observaciones: servicio.observaciones || '',
            reservasActivas: parseInt(servicio.reservasActivas) || 0,
            fecha_creacion: servicio.fecha_creacion
        }));

        console.log('Servicios obtenidos:', serviciosFormateados.length);
        res.status(200).json(serviciosFormateados);
    });
});

// Endpoint para obtener un servicio específico
router.get('/servicios/:id', (req, res) => {
    console.log('Endpoint /api/servicios/:id llamado');

    const { id } = req.params;

    const query = `
        SELECT 
            s.id,
            s.nombre,
            s.descripcion,
            s.categoria,
            s.costo as precio,
            s.disponible,
            s.proveedor_externo as proveedorExterno,
            s.tiempo_preparacion as tiempoPreparacion,
            s.observaciones,
            s.fecha_creacion,
            COUNT(rs.reserva_id) as reservasActivas
        FROM servicio s
        LEFT JOIN reserva_servicio rs ON s.id = rs.servicio_id
        LEFT JOIN reserva r ON rs.reserva_id = r.id AND r.estado IN ('pendiente', 'confirmada')
        WHERE s.id = ?
        GROUP BY s.id, s.nombre, s.descripcion, s.categoria, s.costo, s.disponible,
                 s.proveedor_externo, s.tiempo_preparacion, s.observaciones, s.fecha_creacion
    `;

    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener servicio:', err);
            return res.status(500).json({
                error: 'Error al obtener servicio',
                details: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        const servicio = results[0];
        const servicioFormateado = {
            id: servicio.id,
            nombre: servicio.nombre,
            precio: parseFloat(servicio.precio),
            descripcion: servicio.descripcion || `Servicio de ${servicio.nombre}`,
            categoria: servicio.categoria || 'Otros',
            disponible: Boolean(servicio.disponible),
            proveedorExterno: Boolean(servicio.proveedorExterno),
            tiempoPreparacion: servicio.tiempoPreparacion || '1 día',
            observaciones: servicio.observaciones || '',
            reservasActivas: parseInt(servicio.reservasActivas) || 0,
            fecha_creacion: servicio.fecha_creacion
        };

        res.status(200).json(servicioFormateado);
    });
});

// Endpoint para crear un nuevo servicio
router.post('/servicios', (req, res) => {
    console.log('Endpoint POST /api/servicios llamado');
    console.log('Datos recibidos:', req.body);

    const {
        nombre,
        precio,
        descripcion,
        categoria,
        disponible,
        proveedorExterno,
        tiempoPreparacion,
        observaciones
    } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({
            error: 'Los campos nombre y precio son obligatorios'
        });
    }

    const query = `
        INSERT INTO servicio (
            nombre, costo, descripcion, categoria, disponible, 
            proveedor_externo, tiempo_preparacion, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        nombre,
        precio,
        descripcion || `Servicio de ${nombre}`,
        categoria || 'Otros',
        disponible !== undefined ? disponible : true,
        proveedorExterno || false,
        tiempoPreparacion || '1 día',
        observaciones || ''
    ];

    connection.query(query, valores, (err, result) => {
        if (err) {
            console.error('Error al crear servicio:', err);
            return res.status(500).json({
                error: 'Error al crear servicio',
                details: err.message
            });
        }

        const nuevoServicio = {
            id: result.insertId,
            nombre,
            precio: parseFloat(precio),
            descripcion: descripcion || `Servicio de ${nombre}`,
            categoria: categoria || 'Otros',
            disponible: disponible !== undefined ? disponible : true,
            proveedorExterno: proveedorExterno || false,
            tiempoPreparacion: tiempoPreparacion || '1 día',
            observaciones: observaciones || '',
            reservasActivas: 0
        };

        console.log('Servicio creado con ID:', result.insertId);
        res.status(201).json(nuevoServicio);
    });
});

// Endpoint para actualizar un servicio
router.put('/servicios/:id', (req, res) => {
    console.log('Endpoint PUT /api/servicios llamado');

    const { id } = req.params;
    const {
        nombre,
        precio,
        descripcion,
        categoria,
        disponible,
        proveedorExterno,
        tiempoPreparacion,
        observaciones
    } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({
            error: 'Los campos nombre y precio son obligatorios'
        });
    }

    const query = `
        UPDATE servicio SET 
            nombre = ?, 
            costo = ?, 
            descripcion = ?, 
            categoria = ?, 
            disponible = ?, 
            proveedor_externo = ?, 
            tiempo_preparacion = ?, 
            observaciones = ?
        WHERE id = ?
    `;

    const valores = [
        nombre,
        precio,
        descripcion || `Servicio de ${nombre}`,
        categoria || 'Otros',
        disponible !== undefined ? disponible : true,
        proveedorExterno || false,
        tiempoPreparacion || '1 día',
        observaciones || '',
        id
    ];

    connection.query(query, valores, (err, result) => {
        if (err) {
            console.error('Error al actualizar servicio:', err);
            return res.status(500).json({
                error: 'Error al actualizar servicio',
                details: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Obtener el servicio actualizado
        const getUpdatedQuery = `
            SELECT 
                s.id,
                s.nombre,
                s.descripcion,
                s.categoria,
                s.costo as precio,
                s.disponible,
                s.proveedor_externo as proveedorExterno,
                s.tiempo_preparacion as tiempoPreparacion,
                s.observaciones,
                s.fecha_creacion,
                COUNT(rs.reserva_id) as reservasActivas
            FROM servicio s
            LEFT JOIN reserva_servicio rs ON s.id = rs.servicio_id
            LEFT JOIN reserva r ON rs.reserva_id = r.id AND r.estado IN ('pendiente', 'confirmada')
            WHERE s.id = ?
            GROUP BY s.id, s.nombre, s.descripcion, s.categoria, s.costo, s.disponible,
                     s.proveedor_externo, s.tiempo_preparacion, s.observaciones, s.fecha_creacion
        `;

        connection.query(getUpdatedQuery, [id], (err, results) => {
            if (err) {
                console.error('Error al obtener servicio actualizado:', err);
                return res.status(500).json({
                    error: 'Error al obtener servicio actualizado',
                    details: err.message
                });
            }

            const servicio = results[0];
            const servicioFormateado = {
                id: servicio.id,
                nombre: servicio.nombre,
                precio: parseFloat(servicio.precio),
                descripcion: servicio.descripcion,
                categoria: servicio.categoria,
                disponible: Boolean(servicio.disponible),
                proveedorExterno: Boolean(servicio.proveedorExterno),
                tiempoPreparacion: servicio.tiempoPreparacion,
                observaciones: servicio.observaciones,
                reservasActivas: parseInt(servicio.reservasActivas) || 0,
                fecha_creacion: servicio.fecha_creacion
            };

            console.log('Servicio actualizado:', id);
            res.status(200).json(servicioFormateado);
        });
    });
});

// Endpoint para alternar disponibilidad de un servicio
router.patch('/servicios/:id/disponibilidad', (req, res) => {
    console.log('Endpoint PATCH /api/servicios/:id/disponibilidad llamado');

    const { id } = req.params;

    // Primero obtener el estado actual
    const getCurrentQuery = 'SELECT disponible FROM servicio WHERE id = ?';

    connection.query(getCurrentQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener estado actual:', err);
            return res.status(500).json({
                error: 'Error al obtener estado actual',
                details: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        const nuevoEstado = !results[0].disponible;
        const updateQuery = 'UPDATE servicio SET disponible = ? WHERE id = ?';

        connection.query(updateQuery, [nuevoEstado, id], (err, result) => {
            if (err) {
                console.error('Error al actualizar disponibilidad:', err);
                return res.status(500).json({
                    error: 'Error al actualizar disponibilidad',
                    details: err.message
                });
            }

            console.log('Disponibilidad actualizada para servicio:', id, 'nuevo estado:', nuevoEstado);
            res.status(200).json({
                message: 'Disponibilidad actualizada correctamente',
                disponible: nuevoEstado
            });
        });
    });
});

// Endpoint para eliminar un servicio
router.delete('/servicios/:id', (req, res) => {
    console.log('Endpoint DELETE /api/servicios llamado');

    const { id } = req.params;

    // Verificar si el servicio está siendo usado en reservas activas
    const checkReservasQuery = `
        SELECT COUNT(*) as count 
        FROM reserva_servicio rs
        JOIN reserva r ON rs.reserva_id = r.id
        WHERE rs.servicio_id = ? AND r.estado IN ('pendiente', 'confirmada')
    `;

    connection.query(checkReservasQuery, [id], (err, results) => {
        if (err) {
            console.error('Error al verificar uso del servicio:', err);
            return res.status(500).json({
                error: 'Error al verificar uso del servicio',
                details: err.message
            });
        }

        if (results[0].count > 0) {
            return res.status(400).json({
                error: 'No se puede eliminar el servicio porque está siendo usado en reservas activas'
            });
        }

        // Eliminar primero las referencias en reserva_servicio (para reservas pasadas)
        const deleteReferencesQuery = 'DELETE FROM reserva_servicio WHERE servicio_id = ?';

        connection.query(deleteReferencesQuery, [id], (err) => {
            if (err) {
                console.error('Error al eliminar referencias del servicio:', err);
                return res.status(500).json({
                    error: 'Error al eliminar referencias del servicio',
                    details: err.message
                });
            }

            // Ahora eliminar el servicio
            const deleteQuery = 'DELETE FROM servicio WHERE id = ?';

            connection.query(deleteQuery, [id], (err, result) => {
                if (err) {
                    console.error('Error al eliminar servicio:', err);
                    return res.status(500).json({
                        error: 'Error al eliminar servicio',
                        details: err.message
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: 'Servicio no encontrado' });
                }

                console.log('Servicio eliminado:', id);
                res.status(200).json({ message: 'Servicio eliminado correctamente' });
            });
        });
    });
});

// Endpoint para obtener servicios disponibles (usado por otras partes del sistema)
router.get('/servicios-disponibles', (req, res) => {
    console.log('Endpoint /api/servicios-disponibles llamado');

    const query = `
        SELECT 
            s.id,
            s.nombre,
            s.costo as precio
        FROM servicio s
        WHERE s.disponible = 1
        ORDER BY s.nombre
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener servicios disponibles:', err);
            return res.status(500).json({
                error: 'Error al obtener servicios disponibles',
                details: err.message
            });
        }

        console.log('Servicios disponibles obtenidos:', results.length);
        res.status(200).json(results);
    });
});

module.exports = router;