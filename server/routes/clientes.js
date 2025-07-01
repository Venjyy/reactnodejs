const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Endpoint específico para obtener clientes (usado por el dashboard)
router.get('/clientes', (req, res) => {
    console.log('Endpoint /clientes llamado desde dashboard');

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

// Endpoint API para obtener clientes
router.get('/api/clientes', (req, res) => {
    console.log('Endpoint /api/clientes llamado');

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

// Endpoint para crear cliente desde dashboard
router.post('/clientes', (req, res) => {
    console.log('Endpoint POST /clientes llamado desde dashboard');
    console.log('Datos recibidos:', req.body);

    const { nombre, rut, correo, telefono } = req.body;

    if (!nombre || !rut) {
        return res.status(400).json({
            error: 'Nombre y RUT son requeridos'
        });
    }

    // Verificar si el cliente ya existe por RUT
    const checkQuery = 'SELECT id FROM cliente WHERE rut = ?';

    connection.query(checkQuery, [rut], (err, results) => {
        if (err) {
            console.error('Error al verificar cliente:', err);
            return res.status(500).json({
                error: 'Error al verificar cliente'
            });
        }

        if (results.length > 0) {
            return res.status(409).json({
                error: 'Ya existe un cliente con ese RUT'
            });
        }

        // Insertar nuevo cliente
        const insertQuery = 'INSERT INTO cliente (nombre, rut, correo, telefono) VALUES (?, ?, ?, ?)';

        connection.query(insertQuery, [nombre, rut, correo || '', telefono || ''], (err, result) => {
            if (err) {
                console.error('Error al crear cliente:', err);
                return res.status(500).json({
                    error: 'Error al crear cliente'
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

// Endpoint API para crear cliente
router.post('/api/clientes', (req, res) => {
    console.log('Endpoint POST /api/clientes llamado');
    console.log('Datos recibidos:', req.body);

    const { nombre, rut, correo, telefono } = req.body;

    if (!nombre || !rut) {
        return res.status(400).json({
            error: 'Nombre y RUT son requeridos'
        });
    }

    // Verificar si el cliente ya existe por RUT
    const checkQuery = 'SELECT id FROM cliente WHERE rut = ?';

    connection.query(checkQuery, [rut], (err, results) => {
        if (err) {
            console.error('Error al verificar cliente:', err);
            return res.status(500).json({
                error: 'Error al verificar cliente'
            });
        }

        if (results.length > 0) {
            return res.status(409).json({
                error: 'Ya existe un cliente con ese RUT'
            });
        }

        // Insertar nuevo cliente
        const insertQuery = 'INSERT INTO cliente (nombre, rut, correo, telefono) VALUES (?, ?, ?, ?)';

        connection.query(insertQuery, [nombre, rut, correo || '', telefono || ''], (err, result) => {
            if (err) {
                console.error('Error al crear cliente:', err);
                return res.status(500).json({
                    error: 'Error al crear cliente'
                });
            }

            console.log('Cliente creado con ID:', result.insertId);
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

// Endpoint para actualizar un cliente
router.put('/clientes/:id', (req, res) => {
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
router.delete('/clientes/:id', (req, res) => {
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
router.get('/clientes/:id', (req, res) => {
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

// Endpoint para buscar cliente por RUT
router.get('/api/clientes/buscar-por-rut/:rut', (req, res) => {
    console.log('Endpoint GET /api/clientes/buscar-por-rut/:rut llamado');

    const { rut } = req.params;

    if (!rut) {
        return res.status(400).json({ error: 'RUT es requerido' });
    }

    const query = `
        SELECT 
            id,
            nombre,
            rut,
            correo,
            telefono,
            fecha_creacion
        FROM cliente 
        WHERE rut = ?
    `;

    connection.query(query, [rut], (err, results) => {
        if (err) {
            console.error('Error al buscar cliente por RUT:', err);
            return res.status(500).json({ error: 'Error al buscar cliente' });
        }

        if (results.length === 0) {
            return res.status(404).json({
                error: 'Cliente no encontrado',
                encontrado: false
            });
        }

        console.log('Cliente encontrado por RUT:', results[0]);
        res.status(200).json({
            encontrado: true,
            cliente: results[0]
        });
    });
});

module.exports = router;