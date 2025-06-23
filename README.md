# 🏡 Centro de Eventos Cañete - Sistema de Reservas

> *Un sistema de reservas para gestionar eventos en nuestro acogedor centro ubicado en Cañete, rodeado de naturaleza y tradición*

## 🛠️ Tecnologías Utilizadas (Por el momento)

- **Frontend**: React.js con Axios para comunicación con el servidor
- **Backend**: Node.js con Express en DigitalOcean (o local)
- **Base de datos**: MySQL (Pensando en migrar hacia MariaDB)

## 🚀 Instalación

### Requisitos previos
- Node.js
- MySQL
- npm
- DigitalOcean (Opcional)

### Pasos para iniciar el servidor

# Iniciar servidor (desde la carpeta server)
npm install exceljs jspdf jspdf-autotable moment
npm start / nodemon index.js

(npm start funciona en node ya que lo manejo con scripts)

# Iniciar cliente (desde la carpeta cliente)
npm install (el cliente no tiene dependencias, es necesario installar)
npm install sweetalert2
npm start

```

## 💾 Script de la Base de Datos

-- MySQL Script for CentroEvento Database
-- Version: 1.5
-- Author: Venjy
-- Database creation
CREATE DATABASE IF NOT EXISTS centroevento;
USE centroevento;

-- Admin table
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `pass` varchar(100) NOT NULL,
  `creado_en` datetime DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Client table
CREATE TABLE `cliente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rut` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Event space table
CREATE TABLE `espacio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `capacidad` int NOT NULL,
  `costo_base` decimal(10,2) NOT NULL,
  `descripcion` text,
  `disponible` tinyint(1) DEFAULT '1',
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Services table
CREATE TABLE `servicio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Reservations table
CREATE TABLE `reserva` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_reserva` datetime NOT NULL,
  `estado` varchar(15) NOT NULL,
  `cantidad_personas` int NOT NULL,
  `razon` varchar(100) NOT NULL,
  `cliente_id` int NOT NULL,
  `espacio_id` int NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `espacio_id` (`espacio_id`),
  CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  CONSTRAINT `reserva_ibfk_2` FOREIGN KEY (`espacio_id`) REFERENCES `espacio` (`id`),
  CONSTRAINT `reserva_chk_1` CHECK ((`estado` in ('pendiente','confirmada','cancelada'))),
  CONSTRAINT `reserva_chk_2` CHECK ((`cantidad_personas` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Payments table (ACTUALIZADA con las nuevas columnas)
CREATE TABLE `pago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `monto_total` decimal(10,2) NOT NULL,
  `abono` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) DEFAULT 'Efectivo',
  `observaciones` text,
  `fecha_pago` datetime NOT NULL,
  `reserva_id` int NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reserva_id` (`reserva_id`),
  CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`reserva_id`) REFERENCES `reserva` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Reservation-Services relationship table
CREATE TABLE `reserva_servicio` (
  `reserva_id` int NOT NULL,
  `servicio_id` int NOT NULL,
  PRIMARY KEY (`reserva_id`,`servicio_id`),
  KEY `servicio_id` (`servicio_id`),
  CONSTRAINT `reserva_servicio_ibfk_1` FOREIGN KEY (`reserva_id`) REFERENCES `reserva` (`id`),
  CONSTRAINT `reserva_servicio_ibfk_2` FOREIGN KEY (`servicio_id`) REFERENCES `servicio` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

## 💾 Script para crear datos de ejemplo (recomendado para probar que funciona como deberia)

-- Sample data for admin table
INSERT INTO `admin` VALUES 
(1,'venjy','ben1012','2025-06-06 18:56:49','2025-06-06 18:56:49'),
(2,'admin123','adminpass','2025-06-06 18:56:49','2025-06-06 18:56:49'),
(3,'superadm','superadmpass','2025-06-06 18:56:49','2025-06-06 18:56:49');

-- Sample data for client table
INSERT INTO `cliente` VALUES 
(1,'Juan Pérez','12.345.678-9','juan.perez@email.com','+56912345678','2025-06-06 18:56:49'),
(2,'María González','23.456.789-0','maria.gonzalez@email.com','+56923456789','2025-06-06 18:56:49'),
(3,'Carlos López','34.567.890-1','carlos.lopez@email.com','+56934567890','2025-06-06 18:56:49'),
(4,'Ana Silva','45.678.901-2','ana.silva@email.com','+56945678901','2025-06-06 18:56:49'),
(5,'Pedro Rojas','56.789.012-3','pedro.rojas@email.com','+56956789012','2025-06-06 18:56:49'),
(6,'Laura Méndez','67.890.123-4','laura.mendez@email.com','+56967890123','2025-06-06 18:56:49'),
(7,'Roberto Navarro','78.901.234-5','roberto.navarro@email.com','+56978901234','2025-06-06 18:56:49'),
(8,'Sofía Castro','89.012.345-6','sofia.castro@email.com','+56989012345','2025-06-06 18:56:49'),
(9,'Miguel Ángel Díaz','90.123.456-7','miguel.diaz@email.com','+56990123456','2025-06-06 18:56:49'),
(10,'Valentina Muñoz','01.234.567-8','valentina.munoz@email.com','+56901234567','2025-06-06 18:56:49'),
(12,'Paloma Angelica Lopez Avendaño','21.777.777-7','palomalopez232212@gmail.com','+56 920028963','2025-06-06 19:42:23'),
(14,'Benjamin Flores','21.777.777-0','benjaf243@gmail.com','+56978675634','2025-06-07 15:43:51'),
(15,'Mila Gala Flores Bravo','21.140.360-k','benjaelpro@prosdechile.cl','+56974567543','2025-06-07 16:08:35'),
(17,'jp','2121212','ejemplo@correo.cl','+6546456','2025-06-08 16:07:31'),
(20,'Hernan ','13.123.123-k','hflo73@gmail.com','+38912893','2025-06-09 22:57:19');

-- Sample data for event spaces
INSERT INTO `espacio` VALUES 
(1,'Salón Principal',150,250000.00,'Amplio salón con iluminación profesional y sistema de sonido básico',1,'2025-06-06 18:56:49'),
(2,'Sala VIP',50,150000.00,'Sala exclusiva con decoración premium y ambiente íntimo',1,'2025-06-06 18:56:49'),
(3,'Terraza Jardín',100,180000.00,'Espacio al aire libre con jardín y vista panorámica',1,'2025-06-06 18:56:49'),
(4,'Sala Familiar',30,120000.00,'Ambiente acogedor ideal para reuniones familiares pequeñas',1,'2025-06-06 18:56:49'),
(5,'Salón de Eventos',200,300000.00,'Espacio versátil para eventos corporativos o sociales grandes',1,'2025-06-06 18:56:49'),
(6,'Patio Interior',80,160000.00,'Área semicubierta con fuente y decoración rústica',1,'2025-06-06 18:56:49'),
(7,'Sala Ejecutiva',40,200000.00,'Espacio profesional con equipamiento tecnológico',1,'2025-06-06 18:56:49'),
(8,'Jardín Exterior',120,220000.00,'Amplio jardín con áreas verdes y pérgola',1,'2025-06-06 18:56:49'),
(9,'Salón de Fiestas',180,280000.00,'Espacio diseñado especialmente para celebraciones',1,'2025-06-06 18:56:49'),
(10,'Mirador',60,190000.00,'Área elevada con vista privilegiada y ambiente exclusivo',1,'2025-06-06 18:56:49'),
(13,'lugarepico',12,12312.00,'epicolugar',1,'2025-06-08 16:07:54'),
(14,'Casa principal',100,120000.00,'Casa principal realizada con madera tipica chilena',1,'2025-06-09 22:59:46');

-- Sample data for services
INSERT INTO `servicio` VALUES 
(1,'Catering Básico',15000.00,'2025-06-06 18:56:49'),
(2,'Catering Premium',25000.00,'2025-06-06 18:56:49'),
(3,'Decoración Simple',20000.00,'2025-06-06 18:56:49'),
(4,'Decoración Temática',40000.00,'2025-06-06 18:56:49'),
(5,'Sistema de Sonido',30000.00,'2025-06-06 18:56:49'),
(6,'Iluminación Profesional',35000.00,'2025-06-06 18:56:49'),
(7,'Animador Infantil',25000.00,'2025-06-06 18:56:49'),
(8,'Fotógrafo Profesional',40000.00,'2025-06-06 18:56:49'),
(9,'Barra de Bebidas',30000.00,'2025-06-06 18:56:49'),
(10,'Seguridad Privada',35000.00,'2025-06-06 18:56:49'),
(11,'Ambientación Musical',20000.00,'2025-06-06 18:56:49'),
(12,'Pantalla Gigante',45000.00,'2025-06-06 18:56:49'),
(16,'Pinta Caritas',12000.00,'2025-06-09 23:00:46');

-- Sample data for reservations
INSERT INTO `reserva` VALUES 
(1,'2023-12-15 18:00:00','confirmada',120,'Matrimonio',1,1,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(2,'2023-12-20 16:00:00','confirmada',40,'Baby Shower',2,2,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(3,'2023-12-22 15:00:00','confirmada',80,'Cumpleaños 15 años',3,3,'2025-06-06 18:56:49','2025-06-07 17:10:59'),
(4,'2023-12-25 12:00:00','confirmada',25,'Almuerzo Navideño Familiar',4,4,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(5,'2023-12-28 19:00:00','confirmada',180,'Fiesta de Fin de Año',5,5,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(6,'2024-01-05 17:00:00','confirmada',60,'Reunión de Ex-alumnos',6,6,'2025-06-06 18:56:49','2025-06-07 17:11:00'),
(7,'2024-01-10 14:00:00','confirmada',35,'Presentación de Producto',7,7,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(8,'2024-01-15 20:00:00','confirmada',100,'Boda',8,8,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(9,'2024-01-20 16:00:00','cancelada',50,'Baby Shower',9,2,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(10,'2024-01-25 18:00:00','confirmada',150,'Aniversario de Empresa',10,1,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(11,'2024-02-02 17:00:00','confirmada',30,'Reunión Familiar',1,4,'2025-06-06 18:56:49','2025-06-07 17:11:01'),
(12,'2024-02-10 19:00:00','confirmada',70,'Cumpleaños',2,3,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(13,'2024-02-14 21:00:00','confirmada',90,'Cena de San Valentín',3,6,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(14,'2024-02-20 15:00:00','confirmada',40,'Charla Motivacional',4,7,'2025-06-06 18:56:49','2025-06-07 17:11:02'),
(15,'2024-02-25 18:00:00','confirmada',110,'Graduación Universitaria',5,8,'2025-06-06 18:56:49','2025-06-06 18:56:49'),
(16,'2025-12-10 15:00:00','confirmada',50,'cumpleaños',14,2,'2025-06-07 15:43:56','2025-06-07 15:45:35'),
(17,'2027-09-11 14:00:00','confirmada',80,'cum',15,3,'2025-06-07 16:08:35','2025-06-07 16:12:22'),
(18,'2025-09-30 12:00:00','confirmada',89,'Cumpleaños',12,8,'2025-06-08 15:26:10','2025-06-08 15:27:27'),
(19,'2026-12-10 10:10:00','confirmada',80,'Graduación',2,8,'2025-06-08 15:49:48','2025-06-09 17:37:40'),
(20,'2025-12-22 10:12:00','confirmada',10,'Otro',17,13,'2025-06-08 16:08:56','2025-06-08 16:09:08'),
(21,'2027-12-10 10:12:00','confirmada',12,'Cumpleaños',14,8,'2025-06-09 00:44:59','2025-06-09 17:37:39'),
(23,'2028-12-10 12:00:00','pendiente',25,'Cumpleaños Benjamin',20,2,'2025-06-09 22:57:19','2025-06-09 22:57:19');

-- Sample data for payments (ACTUALIZADA con las nuevas columnas)
INSERT INTO `pago` VALUES 
(1,455000.00,455000.00,'Efectivo','Pago completo del evento','2023-11-10 10:30:00',1,'2025-06-06 18:56:49'),
(2,255000.00,127500.00,'Transferencia Bancaria','Anticipo del 50%','2023-11-15 11:45:00',2,'2025-06-06 18:56:49'),
(3,270000.00,135000.00,'Tarjeta de Crédito','Primer abono','2023-11-20 09:15:00',3,'2025-06-06 18:56:49'),
(4,150000.00,150000.00,'Efectivo','Pago al contado','2023-11-25 16:20:00',4,'2025-06-06 18:56:49'),
(5,540000.00,270000.00,'Transferencia Bancaria','50% de anticipo','2023-11-30 14:10:00',5,'2025-06-06 18:56:49'),
(6,190000.00,95000.00,'Efectivo','Seña del evento','2023-12-05 12:30:00',6,'2025-06-06 18:56:49'),
(7,310000.00,310000.00,'Cheque','Pago total anticipado','2023-12-10 10:15:00',7,'2025-06-06 18:56:49'),
(8,495000.00,247500.00,'Transferencia Bancaria','Anticipo boda','2023-12-15 15:45:00',8,'2025-06-06 18:56:49'),
(9,195000.00,97500.00,'Tarjeta de Débito','Abono inicial','2023-12-20 11:20:00',9,'2025-06-06 18:56:49'),
(10,520000.00,260000.00,'Efectivo','50% del total','2023-12-25 09:30:00',10,'2025-06-06 18:56:49'),
(11,120000.00,60000.00,'Transferencia Bancaria','Primer pago','2024-01-05 14:15:00',11,'2025-06-06 18:56:49'),
(12,225000.00,225000.00,'Efectivo','Pago completo','2024-01-10 17:30:00',12,'2025-06-06 18:56:49'),
(13,300000.00,150000.00,'Tarjeta de Crédito','Anticipo 50%','2024-01-15 10:45:00',13,'2025-06-06 18:56:49'),
(14,235000.00,117500.00,'Transferencia Bancaria','Seña del evento','2024-01-20 13:20:00',14,'2025-06-06 18:56:49'),
(15,375000.00,375000.00,'Efectivo','Pago total graduación','2024-01-25 16:10:00',15,'2025-06-06 18:56:49'),
(16,300000.00,150000.00,'Transferencia Bancaria','Abono cumpleaños','2025-06-08 00:00:00',18,'2025-06-08 16:11:19'),
(17,150000.00,100000.00,'Efectivo','Anticipo evento','2025-06-09 00:00:00',16,'2025-06-09 00:45:24'),
(18,305000.00,150000.00,'Transferencia Bancaria','Primer pago Benjamin','2025-06-10 00:00:00',23,'2025-06-09 23:02:26');

-- Sample data for reservation-services relationship
INSERT INTO `reserva_servicio` VALUES 
(2,1),(3,1),(4,1),(6,1),(9,1),(11,1),(12,1),(15,1),(1,2),(5,2),(8,2),(10,2),(13,2),(17,2),
(2,3),(9,3),(12,3),(21,3),(23,3),(1,4),(8,4),(17,4),(1,5),(3,5),(5,5),(7,5),(8,5),(10,5),
(14,5),(15,5),(17,5),(1,6),(5,6),(7,6),(8,6),(10,6),(15,6),(17,6),(2,7),(9,7),(1,8),(8,8),
(15,8),(19,8),(23,8),(4,9),(6,9),(13,9),(23,9),(18,10),(20,10),(3,11),(5,11),(12,11),(17,11),
(19,11),(20,11),(21,11),(23,11),(7,12),(10,12),(14,12),(17,12),(18,12),(23,12);

## 📋 Funcionalidades

- **Gestión de clientes**: Registro y seguimiento de clientes por RUT
- **Espacios personalizables**: Configuración de distintos espacios con capacidades y costos variables
- **Reservas intuitivas**: Interfaz amigable para reservar fechas y horarios
- **Validaciones automáticas**: Control de disponibilidad y capacidad
- **Servicios adicionales**: Posibilidad de agregar servicios extra a las reservas (próximamente)
