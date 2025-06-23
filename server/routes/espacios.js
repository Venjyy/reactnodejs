const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Endpoint para obtener todos los espacios
router.get('/espacios', (req, res) => {
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
            ubicacion: 'No especificada',
            disponible: !!espacio.disponible,
            equipamiento: 'No especificado',
            caracteristicas: 'No especificadas',
            tipoEspacio: 'Otro',
            dimensiones: 'No especificadas',
            observaciones: '',
            reservasActuales: espacio.reservasActuales || 0
        }));

        console.log('Espacios obtenidos:', espaciosConDatosCompletos.length);
        res.status(200).json(espaciosConDatosCompletos);
    });
});

// Endpoint para obtener un espacio específico
router.get('/espacios/:id', (req, res) => {
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
            disponible: !!espacio.disponible,
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
router.post('/espacios', (req, res) => {
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
            disponible: true,
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
router.put('/espacios/:id', (req, res) => {
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
                disponible: disponible,
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
router.delete('/espacios/:id', (req, res) => {
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
router.patch('/espacios/:id/disponibilidad', (req, res) => {
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

module.exports = router;