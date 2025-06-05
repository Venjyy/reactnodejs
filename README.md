# 🏡 Centro de Eventos Cañete - Sistema de Reservas

> *Un sistema de reservas para gestionar eventos en nuestro acogedor centro ubicado en Cañete, rodeado de naturaleza y tradición*

## 🛠️ Tecnologías Utilizadas (Por el momento)

- **Frontend**: React.js con Axios para comunicación con el servidor
- **Backend**: Node.js con Express 
- **Base de datos**: MySQL

## 🚀 Instalación

### Requisitos previos
- Node.js
- MySQL
- npm

### Pasos para iniciar el servidor
# IMPORTANTE
Ten en consideracion que index.js tiene informacion que se cambia segun el proyecto

# Iniciar servidor (desde la carpeta server)
npm start

# Iniciar cliente (desde la carpeta cliente)
npm start
```

## 💾 Script de la Base de Datos


-- Crear base de datos
CREATE DATABASE IF NOT EXISTS CentroEvento;
USE CentroEvento;

-- Tabla de clientes (sin login, se registran por su RUT)
CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rut VARCHAR(12) NOT NULL UNIQUE,
    correo VARCHAR(100),
    telefono VARCHAR(20),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de espacios físicos
CREATE TABLE espacio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL,
    costo_base DECIMAL(10,2) NOT NULL,
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de servicios adicionales
CREATE TABLE servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    costo DECIMAL(10,2) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de reservas de eventos
CREATE TABLE reserva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_reserva DATETIME NOT NULL, -- Fecha y hora del evento
    estado VARCHAR(15) NOT NULL CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
    cantidad_personas INT NOT NULL CHECK (cantidad_personas > 0), -- Número de asistentes
    razon VARCHAR(100) NOT NULL, -- Nueva columna: motivo del evento
    cliente_id INT NOT NULL,
    espacio_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    FOREIGN KEY (espacio_id) REFERENCES espacio(id)
);

-- Relación muchos a muchos entre reserva y servicio
CREATE TABLE reserva_servicio (
    reserva_id INT NOT NULL,
    servicio_id INT NOT NULL,
    PRIMARY KEY (reserva_id, servicio_id),
    FOREIGN KEY (reserva_id) REFERENCES reserva(id),
    FOREIGN KEY (servicio_id) REFERENCES servicio(id)
);

-- Pagos realizados por reservas
CREATE TABLE pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monto_total DECIMAL(10,2) NOT NULL, -- espacio + servicios
    abono DECIMAL(10,2) NOT NULL,       -- parcial o total
    fecha_pago DATETIME NOT NULL,
    reserva_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reserva_id) REFERENCES reserva(id)
);

-- Tabla de administrador (login simple para pruebas)
CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    pass VARCHAR(100) NOT NULL, -- contraseña sin hash (solo para pruebas)
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📋 Funcionalidades

- **Gestión de clientes**: Registro y seguimiento de clientes por RUT
- **Espacios personalizables**: Configuración de distintos espacios con capacidades y costos variables
- **Reservas intuitivas**: Interfaz amigable para reservar fechas y horarios
- **Validaciones automáticas**: Control de disponibilidad y capacidad
- **Servicios adicionales**: Posibilidad de agregar servicios extra a las reservas (próximamente)
