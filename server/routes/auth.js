const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Endpoint para crear administradores
router.post('/creaAdmin', (req, res) => {
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
router.post('/loginAdmin', (req, res) => {
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

module.exports = router;