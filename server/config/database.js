const mysql = require('mysql2');

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

module.exports = connection;