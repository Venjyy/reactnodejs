# 🏡 Centro de Eventos Cañete - Sistema de Reservas

> *Un sistema de reservas para gestionar eventos en nuestro acogedor centro ubicado en Cañete, rodeado de naturaleza y tradición*

## Tecnologías Utilizadas

### Frontend (React.js)
- **React**: ^19.1.0 - Biblioteca principal para la interfaz de usuario
- **React DOM**: ^19.1.0 - Renderizado del DOM para React
- **React Router DOM**: ^7.6.1 - Enrutamiento y navegación
- **React Calendar**: ^6.0.0 - Componente de calendario interactivo
- **Axios**: ^1.10.0 - Cliente HTTP para comunicación con el servidor
- **SweetAlert2**: ^11.22.1 - Alertas y notificaciones elegantes
- **React Scripts**: 5.0.1 - Herramientas de desarrollo y build
- **React Chatbot Kit**: ^2.2.2 - Framework para chatbots interactivos con React

### Testing (Frontend)
- **@testing-library/react**: ^16.3.0 - Pruebas de componentes React
- **@testing-library/jest-dom**: ^6.6.3 - Matchers adicionales para Jest
- **@testing-library/dom**: ^10.4.0 - Utilidades para testing del DOM
- **@testing-library/user-event**: ^13.5.0 - Simulación de eventos de usuario
- **Web Vitals**: ^2.1.4 - Métricas de rendimiento web

### Backend (Node.js + Express)
- **Express**: ^4.18.2 - Framework web para Node.js
- **MySQL2**: ^3.6.0 - Driver para base de datos MySQL
- **CORS**: ^2.8.5 - Middleware para Cross-Origin Resource Sharing
- **Dotenv**: ^17.0.0 - Carga de variables de entorno
- **Axios**: ^1.10.0 - Cliente HTTP para APIs externas
- **Nodemailer**: ^6.9.0 - Biblioteca para envío de correos electrónicos

### Generación de Reportes y PDFs
- **jsPDF**: ^2.5.2 - Generación de documentos PDF
- **jsPDF-AutoTable**: ^3.8.4 - Tablas automáticas para PDFs
- **ExcelJS**: ^4.4.0 - Generación y manipulación de archivos Excel
- **Canvas**: ^3.1.1 - Renderizado de gráficos y canvas
- **Moment**: ^2.30.1 - Manipulación y formateo de fechas

### Herramientas de Desarrollo
- **Nodemon**: ^3.0.1 - Reinicio automático del servidor en desarrollo

### APIs y Servicios Externos
- **Pagos Online**: Khipu API v3.0 para transferencias bancarias instantáneas
  - 🧪 **Actualmente en modo PRUEBA** (límite: $5,000 CLP)
  - 🚀 **Para producción**: Requiere upgrade de cuenta Khipu
- **APIs Externas**: OpenWeatherMap para pronósticos del clima
- **Correos Electrónicos**: Gmail SMTP para notificaciones automáticas

### 🤖 Chatbot Inteligente (Nuevo)
- **Framework**: React Chatbot Kit
- **Funcionalidades**:
  - 📝 **Modificar Reservas**: Buscar por RUT y modificar fecha/hora
  - ❓ **FAQ Interactivo**: Preguntas frecuentes con respuestas desplegables
  - 📞 **Contacto Directo**: Formulario integrado con notificaciones por email
  - 🎨 **Interfaz Moderna**: Diseño responsive con colores de marca
  - ✅ **Validaciones Inteligentes**: Formato automático de RUT y teléfono
  - 🔄 **Auto-scroll**: Navegación fluida en conversaciones
- **Posicionamiento**: Botón flotante en esquina inferior derecha
- **Notificaciones**: Envío automático de correos al administrador (benjaf243@gmail.com)

### Sistema de Procesamiento de Lenguaje Natural (NLP Básico)
> **Clasificación**: Chatbot conversacional con NLP básico - Entre bots de respuestas fijas y IA generativa

#### Capacidades Avanzadas del Chatbot "Venjy"
- *** Detección de Intenciones Múltiples**: Reconoce saludos + consultas en un mismo mensaje
- *** Extracción de Entidades**: Identifica automáticamente:
  - **Fechas**: "15 de julio", "mañana", "próximo viernes"
  - **Espacios**: Nombres de espacios mencionados en texto libre
  - **Personas**: Número de asistentes esperados
  - **Contexto combinado**: Procesa múltiples entidades simultáneamente

#### Comprensión de Lenguaje Natural
- **Frases complejas**: Entiende "Para fecha 15 de julio en ESPACIOTEST con 6 personas"
- **Consultas naturales**: "¿Está disponible el campo para 20 personas el viernes?"
- **Respuestas contextuales**: Combina información y proporciona sugerencias inteligentes
- **Fallback inteligente**: Sugiere formatos cuando no entiende el mensaje

#### Integración con Base de Datos Real
- **Disponibilidad en tiempo real**: Consulta estado actual de espacios
- **Validaciones automáticas**: Verifica capacidad, fechas futuras y conflictos
- **Respuestas dinámicas**: No usa datos hardcodeados, todo viene de la BD
- **Sugerencias personalizadas**: Propone alternativas según capacidad y disponibilidad

#### Tecnologías NLP Implementadas
- **Expresiones regulares avanzadas**: Para extracción de fechas y entidades
- **Análisis sintáctico**: Procesamiento de texto libre
- **Patrones de intención**: Detección de múltiples intenciones por mensaje
- **Normalización de texto**: Manejo de variaciones en escritura

#### Flujo Conversacional Inteligente
- **Bienvenida animada**: Sistema de bienvenida con animaciones CSS
- **Botones principales mejorados**: Diseño moderno y responsive
- **Mensajes de ayuda**: Guía al usuario cuando no entiende
- **Respuestas combinadas**: Maneja saludos + consultas específicas
- **Validación de entradas**: Formatos automáticos y verificaciones

### Mejoras Técnicas Implementadas especificas del ChatBOT (Julio 2025)
#### Frontend (React)
- **Rediseño visual completo** del chatbot con paleta de colores moderna
- **Sistema de bienvenida animado** con efectos CSS y transiciones suaves
- **Botones principales responsivos** que se adaptan a diferentes pantallas
- **Corrección de conflictos CSS** entre formularios y calendario

#### Backend (Node.js)
- **Endpoints especializados** para consultas de disponibilidad desde chatbot
- **Formateo automático de fechas** en respuestas del servidor
- **Validaciones robustas** para entrada de datos del usuario
- **Integración completa con base de datos** para respuestas verídicas

#### Procesamiento de Mensajes
- **MessageParser.js mejorado**: 
  - Detección de múltiples intenciones por mensaje
  - Extracción avanzada de entidades usando regex
  - Análisis de frases complejas y naturales
- **ActionProvider.js optimizado**:
  - Respuestas combinadas (saludo + información)
  - Sistema de ayuda contextual
  - Fallback inteligente con ejemplos

### Base de Datos
- **MySQL** (Pensando en migrar hacia MariaDB)
- **Alojamiento**: DigitalOcean (o local)

## Instalación

### Requisitos previos
- Node.js
- MySQL
- npm
- DigitalOcean (Opcional)
- Cuenta Khipu para pagos online
- Cuenta OpenWeatherMap para pronósticos del clima

### Pasos para iniciar el servidor

**Instalar dependencias**
cd ./server/ npm install 
cd ./cliente/ npm install 

# Configurar variables de entorno (.env)
**🧪 MODO PRUEBA (límite $5,000 CLP)**
KHIPU_API_KEY=tu-api-key-prueba
KHIPU_RECEIVER_ID=501187 
KHIPU_SECRET=key-khipu-nueva

# 🚀 PARA PRODUCCIÓN: Cambiar por credenciales de producción
- KHIPU_API_KEY=tu-api-key-produccion
- KHIPU_RECEIVER_ID=tu-receiver-id-produccion  
- KHIPU_SECRET=tu-secret-produccion

# 🌤️ API DEL CLIMA (OpenWeatherMap)
- OPENWEATHER_API_KEY=tu-openweather-api-key
  # Para obtener tu API key:
  # 1. Regístrate en https://openweathermap.org/api
  # 2. Ve a "My API keys" en tu cuenta
  # 3. Copia tu API key gratuita (hasta 1,000 llamadas/día)

# 🔗 CONFIGURACIÓN DE URLs
- FRONTEND_URL=http://localhost:3000
- BACKEND_URL=http://localhost:3001

# 📧 CONFIGURACIÓN DE CORREO (Gmail)
# Para usar Gmail necesitas generar una "Contraseña de aplicación" en tu cuenta de Google
# Ve a: Configuración de Google > Seguridad > Verificación en 2 pasos > Contraseñas de aplicaciones
- EMAIL_USER=tu-email@gmail.com
- EMAIL_PASS=tu-contraseña-de-aplicacion-de-16-caracteres

# Iniciar servidor (desde la carpeta server)
npm start / nodemon index.js
(npm start funciona en node ya que lo manejo con scripts)

# Iniciar cliente (desde la carpeta cliente)
npm start

```
### Script Completo para Nueva Instalación

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

-- Services table (ACTUALIZADA con todas las columnas necesarias)
CREATE TABLE `servicio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `costo` decimal(10,2) NOT NULL,
  `descripcion` text,
  `categoria` varchar(50) DEFAULT 'Otros',
  `disponible` tinyint(1) DEFAULT '1',
  `proveedor_externo` tinyint(1) DEFAULT '0',
  `tiempo_preparacion` varchar(50) DEFAULT '1 día',
  `observaciones` text,
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

-- Payments table (ACTUALIZADA con las nuevas columnas - INCLUYE TIPO_PAGO)
CREATE TABLE `pago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `monto_total` decimal(10,2) NOT NULL,
  `abono` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) DEFAULT 'Efectivo',
  `tipo_pago` varchar(20) DEFAULT 'abono',
  `observaciones` text,
  `fecha_pago` datetime NOT NULL,
  `reserva_id` int NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reserva_id` (`reserva_id`),
  CONSTRAINT `pago_ibfk_1` FOREIGN KEY (`reserva_id`) REFERENCES `reserva` (`id`),
  CONSTRAINT `pago_chk_tipo` CHECK ((`tipo_pago` in ('anticipo','abono','pago_total','saldo_final')))
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

##  Script para limpiar datos existentes (TRUNCATE TABLES)

```sql
-- ⚠️ CUIDADO: Esto eliminará TODOS los datos de las tablas
-- Ejecutar solo si quieres empezar con datos limpios

-- Desactivar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar todas las tablas (en orden correcto para evitar errores de FK)
TRUNCATE TABLE reserva_servicio;
TRUNCATE TABLE pago;
TRUNCATE TABLE reserva;
TRUNCATE TABLE servicio;
TRUNCATE TABLE espacio;
TRUNCATE TABLE cliente;
-- No truncamos admin para mantener usuarios administrativos

-- Reactivar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Reiniciar AUTO_INCREMENT a 1 para todas las tablas
ALTER TABLE cliente AUTO_INCREMENT = 1;
ALTER TABLE espacio AUTO_INCREMENT = 1;
ALTER TABLE servicio AUTO_INCREMENT = 1;
ALTER TABLE reserva AUTO_INCREMENT = 1;
ALTER TABLE pago AUTO_INCREMENT = 1;
```

## Script para crear datos de ejemplo (recomendado para probar que funciona como debería)

-- Sample data for client table (5 clientes de ejemplo)
INSERT INTO `cliente` VALUES 
(1,'María Elena González','18.456.789-2','maria.gonzalez@email.com','+56987654321','2025-06-28 10:00:00'),
(2,'Carlos Alberto Mendoza','19.567.890-3','carlos.mendoza@gmail.com','+56976543210','2025-06-28 10:15:00'),
(3,'Ana Sofía Herrera','20.678.901-4','ana.herrera@hotmail.com','+56965432109','2025-06-28 10:30:00'),
(4,'Roberto Patricio Silva','21.789.012-5','roberto.silva@outlook.com','+56954321098','2025-06-28 10:45:00'),
(5,'Valentina Ignacia Rojas','22.890.123-6','valentina.rojas@yahoo.com','+56943210987','2025-06-28 11:00:00');

-- Sample data for event spaces (5 espacios únicos)
INSERT INTO `espacio` VALUES 
(1,'Salón de Cristal',120,280000.00,'Elegante salón con ventanales panorámicos y vista al jardín',1,'2025-06-28 09:00:00'),
(2,'Terraza Campestre',80,220000.00,'Espacio al aire libre rodeado de naturaleza con pérgola de madera nativa',1,'2025-06-28 09:15:00'),
(3,'Quincho Tradicional',60,180000.00,'Auténtico quincho chileno con fogón y ambiente rústico',1,'2025-06-28 09:30:00'),
(4,'Sala Íntima',35,150000.00,'Acogedora sala para eventos familiares con chimenea',1,'2025-06-28 09:45:00'),
(5,'Gran Salón de Eventos',200,350000.00,'Amplio espacio para grandes celebraciones con escenario incluido',1,'2025-06-28 10:00:00');

-- Sample data for services (5 servicios esenciales)
INSERT INTO `servicio` VALUES 
(1,'Catering Gourmet',22000.00,'Menú premium con ingredientes locales y presentación elegante','Catering',1,0,'3 días','Incluye entrada, plato principal, postre y bebidas','2025-06-28 09:00:00'),
(2,'Decoración Temática Premium',35000.00,'Ambientación completa personalizada según la ocasión','Decoración',1,1,'5 días','Flores, manteles, centros de mesa y lighting','2025-06-28 09:15:00'),
(3,'Sonido y DJ Profesional',28000.00,'Equipo de audio profesional con DJ especializado','Sonido y Música',1,1,'2 días','Sistema completo con microfonía inalámbrica','2025-06-28 09:30:00'),
(4,'Fotografía y Video',45000.00,'Cobertura audiovisual completa del evento','Fotografía',1,1,'1 día','Fotos digitales + video destacado del evento','2025-06-28 09:45:00'),
(5,'Servicio de Bar Premium',32000.00,'Barra completa con bartender y coctelería especializada','Catering',1,1,'2 días','Bebidas premium, cocteles y servicio profesional','2025-06-28 10:00:00');

-- Sample data for reservations (5 reservas variadas)
INSERT INTO `reserva` VALUES 
(1,'2025-08-15 18:00:00','confirmada',100,'Matrimonio',1,1,'2025-06-28 11:00:00','2025-06-28 11:00:00'),
(2,'2025-09-22 16:00:00','confirmada',60,'Cumpleaños 50 años',2,2,'2025-06-28 11:15:00','2025-06-28 11:15:00'),
(3,'2025-10-10 14:00:00','pendiente',40,'Baby Shower',3,4,'2025-06-28 11:30:00','2025-06-28 11:30:00'),
(4,'2025-11-05 12:00:00','confirmada',150,'Evento Corporativo',4,5,'2025-06-28 11:45:00','2025-06-28 11:45:00'),
(5,'2025-12-20 19:00:00','confirmada',50,'Cena de Fin de Año',5,3,'2025-06-28 12:00:00','2025-06-28 12:00:00');

-- Sample data for payments (5 pagos con diferentes tipos)
INSERT INTO `pago` VALUES 
(1,520000.00,260000.00,'Transferencia Bancaria','anticipo','Anticipo 50% para matrimonio','2025-06-28 12:00:00',1,'2025-06-28 12:00:00'),
(2,380000.00,190000.00,'Efectivo','abono','Primer abono cumpleaños','2025-06-28 12:15:00',2,'2025-06-28 12:15:00'),
(3,235000.00,100000.00,'Tarjeta de Crédito','anticipo','Seña baby shower','2025-06-28 12:30:00',3,'2025-06-28 12:30:00'),
(4,675000.00,675000.00,'Transferencia Bancaria','pago_total','Pago completo evento corporativo','2025-06-28 12:45:00',4,'2025-06-28 12:45:00'),
(5,290000.00,145000.00,'Efectivo','anticipo','Anticipo cena fin de año','2025-06-28 13:00:00',5,'2025-06-28 13:00:00');

-- Sample data for reservation-services relationship (servicios asignados a reservas)
INSERT INTO `reserva_servicio` VALUES 
(1,1),(1,2),(1,3),(1,4),  -- Matrimonio con servicios completos
(2,1),(2,2),(2,5),        -- Cumpleaños con catering, decoración y bar
(3,2),(3,3),              -- Baby shower con decoración y sonido
(4,1),(4,3),(4,4),        -- Evento corporativo con catering, sonido y fotografía
(5,1),(5,5);              -- Cena fin de año con catering y bar


## Comandos de Prueba y Debugging

### Porfavor ocupar siempre el uso correcto de comandos entre WebRequest y RestMethod (abajo una aclaración si es necesaria)

#### **Invoke-WebRequest** - Para debugging detallado
- **Propósito**: Cliente HTTP completo y detallado
- **Respuesta**: Devuelve un objeto completo con TODA la información HTTP
- **Contenido**: Necesitas acceder a `.Content` para ver los datos
- **Headers**: Incluye headers completos de respuesta y request
- **Status Code**: Muestra códigos de estado HTTP detallados
- **Uso ideal**: Debugging, troubleshooting, análisis de respuestas HTTP completas

```powershell
# Ejemplo de respuesta detallada con Invoke-WebRequest
$response = Invoke-WebRequest -Uri "http://localhost:3001/api/clientes" -UseBasicParsing

# Para ver los datos necesitas:
$response.Content        # Los datos JSON
$response.StatusCode     # Código de estado (200, 404, 500, etc.)
$response.Headers        # Headers HTTP completos
$response.RawContent     # Respuesta HTTP completa cruda
```

#### **Invoke-RestMethod** - Para uso rápido de datos
- **Propósito**: Cliente REST simplificado
- **Respuesta**: Convierte automáticamente JSON a objetos PowerShell
- **Contenido**: Devuelve directamente los datos parseados
- **Headers**: Solo lo esencial
- **Uso ideal**: Consultas rápidas, procesamiento de datos, uso directo de APIs REST

```powershell
# Ejemplo de uso simple con Invoke-RestMethod
$clientes = Invoke-RestMethod -Uri "http://localhost:3001/api/clientes"

# Los datos vienen directamente como objetos PowerShell
$clientes | Format-Table nombre, rut, correo
$clientes.Count  # Número de clientes
```

### Pruebas de Conexión con Khipu API

**Probar conexión con Khipu (PowerShell - WebRequest):**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/khipu/test-conexion" -Method GET -UseBasicParsing
```

**Probar crear un pago de prueba (PowerShell - WebRequest):**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/khipu/pago-prueba" -Method POST -Body '{}' -ContentType "application/json" -UseBasicParsing
```

**Probar la conexión REST (PowerShell - RestMethod):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/khipu/test-conexion"
```

**Probar crear un pago REST (PowerShell - RestMethod):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/khipu/pago-prueba" -Method POST
```

**Verificar conexión a MySQL:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/dashboard/test-db"
```

**Obtener estadísticas del dashboard:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/dashboard/stats"
```

**Verificar conexión a internet para APIs externas:**
```powershell
# Probar conexión con OpenWeatherMap (usando API key de prueba)
Invoke-WebRequest -Uri "http://api.openweathermap.org/data/2.5/weather?q=Canete,CL&appid=test" -UseBasicParsing

# Probar conexión con Khipu
Invoke-WebRequest -Uri "https://khipu.com" -UseBasicParsing

# Verificar API del clima con tu API key real
Invoke-RestMethod -Uri "http://localhost:3001/api/clima"
```

## 🚀 Guía de Despliegue Rápido

Para cuando descargues el proyecto:

1. **Verificar requisitos:**
   ```bash
   node --version
   npm --version
   mysql --version
   ```

2. **Instalar dependencias:**
   ```bash
   # Servidor
   cd server && npm install
   
   # Cliente
   cd ../cliente && npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   # Copiar archivo .env.example a .env (si existe, si no sigue el paso a paso de más abajo para crear las tuyas)
   cp server/.env.example server/.env
   
   # Editar variables de entorno
   notepad server/.env
   ```
   
   **Configuración de APIs externas:**
   - **Khipu**: Obtén tus credenciales en [khipu.com](https://khipu.com)
   - **OpenWeatherMap**: 
     1. Regístrate gratis en [openweathermap.org](https://openweathermap.org/api)
     2. Ve a "My API keys" en tu cuenta
     3. Copia tu API key y ponla en `OPENWEATHER_API_KEY`

4. **Configurar base de datos:**
   ```bash
   # Ejecutar script SQL completo
   mysql -u root -p < script_database.sql
   ```

5. **Probar conexiones:**
   ```powershell
   # Verificar DB
   Invoke-RestMethod -Uri "http://localhost:3001/api/dashboard/test-db"
   
   # Verificar Khipu
   Invoke-RestMethod -Uri "http://localhost:3001/api/khipu/test-conexion"
   ```

6. **Iniciar aplicación:**
   ```bash
   # Terminal 1: Servidor
   cd server && npm start
   
   # Terminal 2: Cliente
   cd cliente && npm start
   ```


## 🤖 Configuración del Chatbot

### Funcionalidades del Asistente Virtual "Venjy"
> **Clasificación**: Chatbot conversacional con NLP básico

El chatbot integrado ofrece las siguientes funcionalidades avanzadas:

#### 1. 📝 **Modificar Reservas**
- **Búsqueda inteligente por RUT**: Formato automático y validación
- **Listado de reservas activas**: Solo reservas futuras y válidas
- **Modificación de fecha/hora**: Interface intuitiva con calendario
- **Validaciones en tiempo real**: Verificación de disponibilidad automática contra BD

#### 2. ❓ **FAQ Interactivo**
- **Preguntas frecuentes**: Horarios, servicios, políticas
- **Interface desplegable**: Navegación fluida
- **Contenido actualizado**: Información específica del negocio

#### 3. 📞 **Contacto Directo**
- **Formulario integrado**: Nombre, teléfono, correo, mensaje
- **Validaciones avanzadas**: 
  - Formato automático de teléfono chileno (+569 1234 5678)
  - Validación de correo electrónico
  - Campos obligatorios con SweetAlert2
- **Notificaciones por email**: Envío automático al administrador
- **Confirmación al usuario**: Mensaje de éxito con horarios de respuesta

#### 4. 🧠 **Consultas de Disponibilidad en Lenguaje Natural**
- **Comprende frases complejas**: "Para el 15 de julio en el salón con 50 personas"
- **Extrae entidades automáticamente**: Fecha, espacio, número de personas
- **Respuestas con datos reales**: Consulta directa a la base de datos
- **Sugerencias inteligentes**: Propone alternativas según capacidad y disponibilidad
- **Manejo de múltiples intenciones**: Saludo + consulta en un mismo mensaje

### Configuración Técnica

#### Endpoints del Chatbot
```javascript
// Buscar reservas por RUT
GET /api/reservas/cliente/:rut

// Modificar fecha y hora de reserva
PUT /api/reservas/:id/fecha-hora

// Enviar mensaje de contacto
POST /api/contacto-chatbot
```

#### Configuración de Correos
**Consultar guía detallada**: Ver `server/CONFIGURACION_GMAIL.md` para instrucciones paso a paso

#### Diseño y UX
- **Posición**: Botón flotante en esquina inferior derecha
- **Colores**: Paleta de marca (#8B4CF7, #4ECDC4, etc.)
- **Responsive**: Adaptable a dispositivos móviles
- **Auto-scroll**: Navegación automática a mensajes recientes
- **Animaciones**: Transiciones suaves y loading states


## 📋 Funcionalidades totales y esperadas del sistema.

- **Gestión de clientes**: Registro y seguimiento de clientes por RUT
- **Espacios personalizables**: Configuración de distintos espacios con capacidades y costos variables
- **Reservas intuitivas**: Interfaz amigable para reservar fechas y horarios
- **Validaciones automáticas**: Control de disponibilidad y capacidad
- **Servicios adicionales**: Posibilidad de agregar servicios extra a las reservas
- **🤖 Chatbot inteligente**: Asistente virtual "Venjy" con funciones avanzadas
- **💰 Pagos online**: Integración con Khipu para transferencias bancarias
- **📧 Notificaciones automáticas**: Sistema de correos para contacto directo
- **📱 Responsive design**: Compatible con dispositivos móviles
- **🎨 UI moderna**: Interfaz elegante con SweetAlert2

### 🔍 Validaciones Avanzadas Implementadas

#### RUT Chileno
- **Formato automático**: 12.345.678-9
- **Validación de dígito verificador**: Algoritmo módulo 11
- **Feedback visual**: Colores y iconos indicativos
- **Limpieza automática**: Eliminación de caracteres no válidos

#### Teléfono Chileno  
- **Formato automático**: +569 1234 5678
- **Validación**: Solo números chilenos móviles (9 dígitos)
- **Auto-completado**: Agrega +569 automáticamente
- **Verificación**: Confirma 8 dígitos después del código

#### Correo Electrónico
- **Validación regex**: Formato estándar de email
- **Dominios válidos**: Verificación de estructura
- **Feedback inmediato**: Validación en tiempo real

#### Fechas y Disponibilidad
- **Verificación de disponibilidad**: Consulta automática al servidor
- **Fechas futuras**: Solo permite fechas posteriores a hoy
- **Horarios válidos**: Validación de rangos horarios del negocio
- **Conflictos**: Prevención de reservas duplicadas
