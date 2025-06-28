const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cache en memoria para evitar llamadas innecesarias
const cacheClima = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos en milisegundos

// Configuración desde variables de entorno
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CIUDADES = process.env.WEATHER_CITIES ? process.env.WEATHER_CITIES.split(',') : ['Cayucupil,CL', 'Cañete,CL'];

// Función para limpiar cache expirado
const limpiarCacheExpirado = () => {
    const ahora = Date.now();
    for (const [clave, datos] of cacheClima.entries()) {
        if (ahora - datos.timestamp > CACHE_DURATION) {
            cacheClima.delete(clave);
        }
    }
};

// Función para obtener coordenadas de una ciudad
const obtenerCoordenadas = async (nombreCiudad) => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/geo/1.0/direct?q=${nombreCiudad}&limit=1&appid=${API_KEY}`
        );

        if (response.data && response.data.length > 0) {
            const { lat, lon, name } = response.data[0];
            return { lat, lon, name };
        }
        return null;
    } catch (error) {
        console.error(`Error al obtener coordenadas para ${nombreCiudad}:`, error.message);
        return null;
    }
};

// Ruta para obtener el pronóstico del clima
router.get('/pronostico/:fecha', async (req, res) => {
    try {
        const { fecha } = req.params;

        if (!fecha) {
            return res.status(400).json({
                success: false,
                error: 'Fecha es requerida'
            });
        }

        if (!API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'API key del clima no configurada'
            });
        }

        // Limpiar cache expirado
        limpiarCacheExpirado();

        // Verificar cache
        const cacheKey = `clima_${fecha}`;
        if (cacheClima.has(cacheKey)) {
            const datosCache = cacheClima.get(cacheKey);
            console.log(`Cache hit para fecha: ${fecha}`);
            return res.json({
                success: true,
                data: datosCache.data,
                cached: true
            });
        }

        console.log(`Obteniendo pronóstico del clima para fecha: ${fecha}`);

        let coordenadas = null;

        // Intentar obtener coordenadas para cada ciudad
        for (const ciudad of CIUDADES) {
            coordenadas = await obtenerCoordenadas(ciudad.trim());
            if (coordenadas) {
                console.log(`Coordenadas encontradas para ${ciudad}:`, coordenadas);
                break;
            }
        }

        if (!coordenadas) {
            return res.status(404).json({
                success: false,
                error: 'No se pudieron obtener las coordenadas de ninguna ciudad'
            });
        }

        const fechaSeleccionada = new Date(fecha);
        const ahora = new Date();
        const diferenciaDias = Math.ceil((fechaSeleccionada - ahora) / (1000 * 60 * 60 * 24));

        let datosClima = null;

        if (diferenciaDias <= 5) {
            // Para fechas dentro de los próximos 5 días, usar forecast
            console.log(`Usando forecast para fecha dentro de 5 días: ${diferenciaDias} días`);
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${coordenadas.lat}&lon=${coordenadas.lon}&appid=${API_KEY}&units=metric&lang=es`
            );

            // Buscar el pronóstico más cercano a la fecha seleccionada
            const pronosticos = response.data.list;
            const fechaBuscada = fechaSeleccionada.toISOString().split('T')[0];

            const pronosticoDelDia = pronosticos.find(item => {
                const fechaPronostico = new Date(item.dt * 1000).toISOString().split('T')[0];
                return fechaPronostico === fechaBuscada;
            }) || pronosticos[0]; // Fallback al primer pronóstico si no encuentra exacto

            if (pronosticoDelDia) {
                // Debug: Mostrar los datos completos que recibimos
                console.log('=== DATOS COMPLETOS DEL PRONÓSTICO ===');
                console.log('POP (Probability of Precipitation):', pronosticoDelDia.pop);
                console.log('Rain data:', pronosticoDelDia.rain);
                console.log('Snow data:', pronosticoDelDia.snow);
                console.log('Weather main:', pronosticoDelDia.weather[0].main);
                console.log('Weather description:', pronosticoDelDia.weather[0].description);
                console.log('Main data:', {
                    temp: pronosticoDelDia.main.temp,
                    humidity: pronosticoDelDia.main.humidity,
                    pressure: pronosticoDelDia.main.pressure
                });
                console.log('=====================================');

                datosClima = {
                    ciudad: coordenadas.name,
                    temperatura: Math.round(pronosticoDelDia.main.temp),
                    descripcion: pronosticoDelDia.weather[0].description,
                    humedad: pronosticoDelDia.main.humidity,
                    viento: pronosticoDelDia.wind.speed,
                    icono: pronosticoDelDia.weather[0].icon,
                    fecha: fecha,
                    tipo: 'forecast',
                    // Datos de precipitación
                    probabilidad_lluvia: pronosticoDelDia.pop ? Math.round(pronosticoDelDia.pop * 100) : 0, // Convertir de decimal a porcentaje
                    precipitacion: pronosticoDelDia.rain ? pronosticoDelDia.rain['3h'] || 0 : 0, // Precipitación en mm en las últimas 3 horas
                    nieve: pronosticoDelDia.snow ? pronosticoDelDia.snow['3h'] || 0 : 0 // Nieve en mm en las últimas 3 horas
                };

                console.log('Datos procesados:', {
                    probabilidad_lluvia: datosClima.probabilidad_lluvia,
                    precipitacion: datosClima.precipitacion,
                    nieve: datosClima.nieve
                });
            }
        } else {
            // Para fechas más lejanas, mostrar información general del clima actual
            console.log(`Usando clima actual para fecha lejana: ${diferenciaDias} días`);
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${coordenadas.lat}&lon=${coordenadas.lon}&appid=${API_KEY}&units=metric&lang=es`
            );

            // Debug: Mostrar los datos del clima actual
            console.log('=== DATOS CLIMA ACTUAL ===');
            console.log('Rain data:', response.data.rain);
            console.log('Snow data:', response.data.snow);
            console.log('Weather main:', response.data.weather[0].main);
            console.log('Weather description:', response.data.weather[0].description);
            console.log('===============================');

            datosClima = {
                ciudad: coordenadas.name,
                temperatura: Math.round(response.data.main.temp),
                descripcion: response.data.weather[0].description,
                humedad: response.data.main.humidity,
                viento: response.data.wind.speed,
                icono: response.data.weather[0].icon,
                fecha: fecha,
                tipo: 'estimado',
                // Para clima actual, usar datos básicos de precipitación
                probabilidad_lluvia: 0, // No disponible en clima actual
                precipitacion: response.data.rain ? response.data.rain['1h'] || 0 : 0, // Precipitación en la última hora
                nieve: response.data.snow ? response.data.snow['1h'] || 0 : 0 // Nieve en la última hora
            };
        }

        if (!datosClima) {
            return res.status(404).json({
                success: false,
                error: 'No se pudo obtener información del clima'
            });
        }

        // Guardar en cache con timestamp
        cacheClima.set(cacheKey, {
            data: datosClima,
            timestamp: Date.now()
        });

        console.log(`Pronóstico obtenido exitosamente para ${fecha}: ${datosClima.temperatura}°C, ${datosClima.descripcion}`);

        res.json({
            success: true,
            data: datosClima,
            cached: false
        });

    } catch (error) {
        console.error('Error al obtener pronóstico del clima:', error.message);

        // Determinar el tipo de error
        let statusCode = 500;
        let errorMessage = 'Error interno del servidor';

        if (error.response) {
            // Error de la API de OpenWeatherMap
            statusCode = error.response.status;
            errorMessage = `Error de la API del clima: ${error.response.data?.message || error.message}`;
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            // Error de conectividad
            statusCode = 503;
            errorMessage = 'Servicio de clima temporalmente no disponible';
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage
        });
    }
});

// Ruta para limpiar cache manualmente (útil para desarrollo)
router.delete('/cache', (req, res) => {
    cacheClima.clear();
    res.json({
        success: true,
        message: 'Cache del clima limpiado exitosamente'
    });
});

// Ruta para obtener estadísticas del cache
router.get('/cache/stats', (req, res) => {
    limpiarCacheExpirado();
    res.json({
        success: true,
        data: {
            entradas: cacheClima.size,
            configuracion: {
                duracion_cache_minutos: CACHE_DURATION / (60 * 1000),
                ciudades_configuradas: CIUDADES,
                api_key_configurada: !!API_KEY
            }
        }
    });
});

module.exports = router;
