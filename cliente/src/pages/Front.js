import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Front.css'; // Asegúrate de tener este archivo CSS
import Swal from 'sweetalert2';
import PagoKhipu from '../components/PagoKhipu'; // Importar componente de pago
import bgImage from '../assets/images/bg.jpg';
import fotorefImage from '../assets/images/fotoref.png';
import saloninteriorImage from '../assets/images/saloninterior.jpg';
import cocinaImage from '../assets/images/cocina.jfif';
import logoImage from '../assets/images/logo.png';
import campobandera from '../assets/images/campobandera.jfif';
import campo01 from '../assets/images/campo01.jfif';
import campo02 from '../assets/images/campo02.jfif';
import campo03 from '../assets/images/campo03.jfif';
import bgImage2 from '../assets/images/bg01.jpg';

function Front() {
    // Estados para la sección de reserva
    const [nombre, setNombre] = useState('');
    const [rut, setRut] = useState('');
    const [correo, setCorreo] = useState('');
    const [contacto, setContacto] = useState('');
    const [fecha, setFecha] = useState('');
    const [horario, setHorario] = useState('');
    const [personas, setPersonas] = useState('');
    const [razon, setRazon] = useState('');
    const [espacioId, setEspacioId] = useState('');
    const [espacios, setEspacios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
    const [mensaje, setMensaje] = useState('');
    const [status, setStatus] = useState('');

    // Estados para el calendario
    const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const [fechasOcupadas, setFechasOcupadas] = useState([]);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [cargandoDisponibilidad, setCargandoDisponibilidad] = useState(false);
    const [serviciosOcupados, setServiciosOcupados] = useState([]);

    // Estados para animaciones del hero con transición mejorada
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const [transitionState, setTransitionState] = useState('idle'); // 'idle', 'fade-out', 'fade-in', 'fade-complete'

    // Estados para el clima
    const [cacheClima, setCacheClima] = useState(new Map()); // Cache para evitar llamadas innecesarias
    const [cargandoClima, setCargandoClima] = useState(false);

    // Estados para el pago con Khipu
    const [mostrarPagoKhipu, setMostrarPagoKhipu] = useState(false);
    const [reservaCreada, setReservaCreada] = useState(null);

    // Arrays para rotación
    const textosRotativos = [
        "Asegura tu lugar con nosotros",
        "Crea momentos inolvidables",
        "Vive experiencias únicas",
        "Tu evento perfecto te espera",
        "Donde los sueños se hacen realidad"
    ];

    const backgroundImages = [bgImage, bgImage2];

    // Función para obtener el pronóstico del clima desde nuestro backend seguro
    const obtenerPronosticoClima = async (fecha) => {
        if (!fecha) return null;

        const fechaClave = fecha.toISOString().split('T')[0];

        // Verificar cache primero
        if (cacheClima.has(fechaClave)) {
            console.log('Usando datos del cache local para:', fechaClave);
            return cacheClima.get(fechaClave);
        }

        setCargandoClima(true);

        try {
            console.log(`Consultando pronóstico del clima para: ${fechaClave}`);

            // Llamar a nuestro backend seguro
            const response = await Axios.get(`http://localhost:3001/api/clima/pronostico/${fechaClave}`);

            if (response.data.success) {
                const datosClima = response.data.data;

                // Guardar en cache local
                const nuevoCache = new Map(cacheClima);
                nuevoCache.set(fechaClave, datosClima);
                setCacheClima(nuevoCache);

                console.log(`Pronóstico obtenido exitosamente:`, datosClima);
                return datosClima;
            } else {
                throw new Error(response.data.error || 'Error al obtener datos del clima');
            }

        } catch (error) {
            console.error('Error al obtener pronóstico del clima:', error);

            // Manejar diferentes tipos de errores
            if (error.response) {
                // Error del servidor backend
                if (error.response.status === 503) {
                    console.error('Servicio de clima temporalmente no disponible');
                } else if (error.response.status === 404) {
                    console.error('No se encontraron datos para esta ubicación');
                } else {
                    console.error('Error del servidor:', error.response.data?.error);
                }
            } else if (error.request) {
                // Error de conexión con el backend
                console.error('Error de conexión con el servidor');
            } else {
                // Otro tipo de error
                console.error('Error inesperado:', error.message);
            }

            return null;
        } finally {
            setCargandoClima(false);
        }
    };

    // Función para mostrar el pronóstico con SweetAlert
    const mostrarPronosticoClima = async (fecha) => {
        if (!fecha) return;

        const datosClima = await obtenerPronosticoClima(fecha);

        if (!datosClima) {
            Swal.fire({
                title: '🌤️ Pronóstico del Clima',
                text: 'No se pudo obtener información del clima para esta fecha. Por favor, intenta más tarde.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#4CAF50'
            });
            return;
        }

        const fechaFormateada = fecha.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const iconoUrl = `https://openweathermap.org/img/wn/${datosClima.icono}@2x.png`;

        let mensajeTipo = '';
        if (datosClima.tipo === 'estimado') {
            mensajeTipo = '<p style="font-size: 0.9em; color: #666; margin-top: 10px;"><em>* Para fechas lejanas mostramos una estimación basada en el clima actual de la zona</em></p>';
        }

        Swal.fire({
            title: '🌤️ Pronóstico del Clima',
            html: `
                <div style="text-align: center;">
                    <p style="font-size: 1.1em; margin-bottom: 15px;">
                        <strong>${fechaFormateada}</strong><br>
                        <span style="color: #666;">${datosClima.ciudad}</span>
                    </p>
                    
                    <div style="display: flex; align-items: center; justify-content: center; margin: 20px 0;">
                        <img src="${iconoUrl}" alt="Clima" style="width: 64px; height: 64px;">
                        <div style="margin-left: 15px; text-align: left;">
                            <div style="font-size: 2em; font-weight: bold; color: #2196F3;">
                                ${datosClima.temperatura}°C
                            </div>
                            <div style="font-size: 1.1em; text-transform: capitalize; color: #333;">
                                ${datosClima.descripcion}
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; text-align: left;">
                        <div style="background: #f5f5f5; padding: 10px; border-radius: 8px;">
                            <div style="font-weight: bold; color: #555;">💧 Humedad</div>
                            <div style="font-size: 1.2em; color: #2196F3;">${datosClima.humedad}%</div>
                        </div>
                        <div style="background: #f5f5f5; padding: 10px; border-radius: 8px;">
                            <div style="font-weight: bold; color: #555;">💨 Viento</div>
                            <div style="font-size: 1.2em, color: #2196F3;">${datosClima.viento} m/s</div>
                        </div>
                    </div>
                    
                    ${datosClima.tipo === 'forecast' ? `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; text-align: left;">
                        <div style="background: #e3f2fd; padding: 10px; border-radius: 8px;">
                            <div style="font-weight: bold, color: #555;">🌧️ Prob. Lluvia</div>
                            <div style="font-size: 1.2em, color: #2196F3;">${datosClima.probabilidad_lluvia}%</div>
                        </div>
                        <div style="background: #e3f2fd; padding: 10px; border-radius: 8px;">
                            <div style="font-weight: bold, color: #555;">☔ Precipitación</div>
                            <div style="font-size: 1.2em, color: #2196F3;">${datosClima.precipitacion} mm</div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${datosClima.precipitacion > 0 || datosClima.nieve > 0 ? `
                    <div style="background: #fff3e0; padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #ff9800;">
                        <div style="font-weight: bold; color: #f57c00; margin-bottom: 5px;">⚠️ Condiciones de Precipitación</div>
                        ${datosClima.precipitacion > 0 ? `<div style="color: #555;">• Lluvia esperada: ${datosClima.precipitacion} mm</div>` : ''}
                        ${datosClima.nieve > 0 ? `<div style="color: #555;">• Nieve esperada: ${datosClima.nieve} mm</div>` : ''}
                        <div style="font-size: 0.9em; color: #666; margin-top: 5px;">Considera tener un plan alternativo bajo techo</div>
                    </div>
                    ` : ''}
                    
                    ${mensajeTipo}
                    
                    <p style="font-size: 0.9em; color: #888; margin-top: 15px;">
                        ℹ️ Esta información te ayudará a planificar mejor tu evento
                    </p>
                </div>
            `,
            confirmButtonText: 'Perfecto, gracias',
            confirmButtonColor: '#4CAF50',
            width: '450px',
            padding: '20px'
        });
    };

    // Función para formatear RUT automáticamente
    const formatearRut = (valor) => {
        // Remover todos los caracteres que no sean números o K/k
        const soloNumeros = valor.replace(/[^0-9kK]/g, '');

        // Limitar a máximo 9 caracteres
        if (soloNumeros.length > 9) {
            return rut; // Retornar el valor anterior si excede 9 caracteres
        }

        if (soloNumeros.length === 0) return '';

        // Separar números y dígito verificador
        const cuerpo = soloNumeros.slice(0, -1);
        const dv = soloNumeros.slice(-1);

        // Formatear solo si hay al menos 2 caracteres
        if (soloNumeros.length < 2) {
            return soloNumeros;
        }

        // Agregar puntos cada 3 dígitos desde la derecha
        let cuerpoFormateado = '';
        for (let i = cuerpo.length - 1, j = 0; i >= 0; i--, j++) {
            if (j > 0 && j % 3 === 0) {
                cuerpoFormateado = '.' + cuerpoFormateado;
            }
            cuerpoFormateado = cuerpo[i] + cuerpoFormateado;
        }

        return cuerpoFormateado + '-' + dv.toUpperCase();
    };

    // Función para formatear número de contacto
    const formatearContacto = (valor) => {
        // Remover todo lo que no sean números
        const soloNumeros = valor.replace(/\D/g, '');

        // Si el usuario borra el prefijo, mantenerlo
        if (soloNumeros.length === 0) {
            return '+569 ';
        }

        // Si no comienza con 569, agregarlo
        let numeroCompleto = soloNumeros;
        if (!numeroCompleto.startsWith('569')) {
            numeroCompleto = '569' + soloNumeros;
        }

        // Limitar a 11 dígitos (569 + 8 dígitos del número)
        if (numeroCompleto.length > 11) {
            numeroCompleto = numeroCompleto.substring(0, 11);
        }

        // Formatear como +569 XXXXXXXX
        if (numeroCompleto.length > 3) {
            const numero = numeroCompleto.substring(3);
            return `+569 ${numero}`;
        }

        return '+569 ';
    };

    // Manejar cambios en el RUT
    const handleRutChange = (e) => {
        const valorFormateado = formatearRut(e.target.value);
        setRut(valorFormateado);
    };

    // Manejar cambios en el contacto
    const handleContactoChange = (e) => {
        const valorFormateado = formatearContacto(e.target.value);
        setContacto(valorFormateado);
    };

    // Función para cargar fechas ocupadas
    const cargarFechasOcupadas = async (espacioId) => {
        if (!espacioId) return;

        setCargandoDisponibilidad(true);
        try {
            console.log('Cargando fechas ocupadas para espacio:', espacioId);
            const response = await Axios.get(`http://localhost:3001/api/disponibilidad/${espacioId}`);
            console.log('Respuesta del servidor para fechas ocupadas:', response.data);

            const fechasOcupadasFormateadas = (response.data.fechasOcupadas || []).map(fecha => {
                // Asegurar que todas las fechas estén en formato Date
                if (typeof fecha === 'string') {
                    return new Date(fecha + 'T00:00:00');
                }
                return new Date(fecha);
            });

            console.log('Fechas ocupadas formateadas:', fechasOcupadasFormateadas);
            setFechasOcupadas(fechasOcupadasFormateadas);
        } catch (error) {
            console.error('Error al cargar disponibilidad:', error);
            setFechasOcupadas([]);
        } finally {
            setCargandoDisponibilidad(false);
        }
    };

    // Función para cargar servicios ocupados en una fecha
    const cargarServiciosOcupados = async (fecha) => {
        if (!fecha) {
            setServiciosOcupados([]);
            return;
        }

        try {
            const response = await Axios.get(`http://localhost:3001/api/servicios-ocupados/${fecha}`);
            setServiciosOcupados(response.data.serviciosOcupados || []);
        } catch (error) {
            console.error('Error al cargar servicios ocupados:', error);
            setServiciosOcupados([]);
        }
    };

    // Función para verificar si una fecha está ocupada
    const esFechaOcupada = (fecha) => {
        const fechaString = fecha.toISOString().split('T')[0];
        return fechasOcupadas.some(fechaOcupada => {
            // Convertir la fecha ocupada a string para comparación
            let fechaOcupadaString;
            if (fechaOcupada instanceof Date) {
                fechaOcupadaString = fechaOcupada.toISOString().split('T')[0];
            } else if (typeof fechaOcupada === 'string') {
                // Si es string, puede venir en formato 'YYYY-MM-DD' o como timestamp
                fechaOcupadaString = fechaOcupada.split('T')[0];
            } else {
                // Si es otro formato, intentar convertir a Date primero
                const fechaTemp = new Date(fechaOcupada);
                fechaOcupadaString = fechaTemp.toISOString().split('T')[0];
            }
            return fechaOcupadaString === fechaString;
        });
    };

    // Función para deshabilitar fechas pasadas y ocupadas
    const esFechaDeshabilitada = ({ date, view }) => {
        if (view !== 'month') return false;

        const hoy = new Date();
        // Configurar la hora a medianoche para comparación exacta de fechas
        hoy.setHours(0, 0, 0, 0);

        // Configurar la fecha a comparar también a medianoche
        const fechaComparar = new Date(date);
        fechaComparar.setHours(0, 0, 0, 0);

        // Deshabilitar fechas pasadas (antes de hoy) Y el día actual
        if (fechaComparar <= hoy) return true;

        // Deshabilitar fechas ocupadas para el espacio seleccionado
        return esFechaOcupada(date);
    };

    // Función para aplicar clases CSS a los días
    const obtenerClaseDia = ({ date, view }) => {
        if (view !== 'month') return null;

        const clases = [];

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fechaComparar = new Date(date);
        fechaComparar.setHours(0, 0, 0, 0);

        // Clase para fechas ocupadas (siempre aplicar primero para que tenga prioridad visual)
        if (esFechaOcupada(date)) {
            clases.push('fecha-ocupada');
        }
        // Clase para fechas disponibles (solo si no está ocupada, no es pasada Y no es hoy)
        else if (fechaComparar > hoy) {
            clases.push('fecha-disponible');
        }

        // Clase para fecha seleccionada (aplicar al final para que tenga la mayor prioridad)
        if (fechaSeleccionada && date.toDateString() === fechaSeleccionada.toDateString()) {
            clases.push('fecha-seleccionada');
        }

        return clases.join(' ');
    };

    // Manejar selección de fecha en el calendario
    const manejarSeleccionFecha = async (fecha) => {
        // Validar que la fecha no esté deshabilitada
        if (esFechaDeshabilitada({ date: fecha, view: 'month' })) {
            console.log('Fecha deshabilitada seleccionada:', fecha);
            return;
        }

        // Validar que la fecha no sea pasada o sea hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaSeleccionadaComparar = new Date(fecha);
        fechaSeleccionadaComparar.setHours(0, 0, 0, 0);

        if (fechaSeleccionadaComparar <= hoy) {
            setMensaje('Solo se pueden seleccionar fechas futuras (a partir de mañana).');
            setStatus('error');
            return;
        }

        // Validar que la fecha no esté ocupada
        if (esFechaOcupada(fecha)) {
            setMensaje('Esta fecha ya está ocupada para el espacio seleccionado. Por favor elige otra fecha.');
            setStatus('error');
            return;
        }

        setFechaSeleccionada(fecha);
        const fechaString = fecha.toISOString().split('T')[0];
        setFecha(fechaString);
        setMostrarCalendario(false);

        // Limpiar mensajes de error previos
        setMensaje('');
        setStatus('');

        // Cargar servicios ocupados para la fecha seleccionada
        cargarServiciosOcupados(fechaString);

        // Limpiar servicios seleccionados para evitar conflictos
        setServiciosSeleccionados([]);

        // Mostrar pronóstico del clima para la fecha seleccionada
        await mostrarPronosticoClima(fecha);
    };

    // Manejar cambio de espacio
    const handleEspacioChange = (e) => {
        const nuevoEspacioId = e.target.value;
        setEspacioId(nuevoEspacioId);

        // Limpiar fecha seleccionada al cambiar espacio
        setFecha('');
        setFechaSeleccionada(null);
        setServiciosOcupados([]);
        setServiciosSeleccionados([]);

        // Cargar disponibilidad del nuevo espacio
        if (nuevoEspacioId) {
            cargarFechasOcupadas(nuevoEspacioId);
        }
    };

    // Cargar espacios y servicios disponibles al cargar el componente
    useEffect(() => {
        document.title = 'El Patio de Lea - Centro de Eventos';

        // Configurar el background inicial
        document.documentElement.style.setProperty('--hero-bg-image', `url(${backgroundImages[0]})`);
        document.documentElement.style.setProperty('--hero-bg-image-next', `url(${backgroundImages[1]})`);

        // Cargar espacios desde el backend
        Axios.get('http://localhost:3001/espacios')
            .then((response) => {
                console.log('Espacios cargados:', response.data);
                if (response.data.length > 0) {
                    setEspacios(response.data);
                    // NO establecer automáticamente el primer espacio, dejar que el usuario seleccione
                    // setEspacioId permanece como cadena vacía
                } else {
                    console.log('No hay espacios disponibles');
                    setMensaje('No hay espacios disponibles. Contacte al administrador para configurar los espacios.');
                    setStatus('error');
                }
            })
            .catch((error) => {
                console.error('Error al cargar espacios:', error);
                setMensaje('Error al cargar espacios. Contacte al administrador.');
                setStatus('error');
            });

        // Cargar servicios disponibles
        Axios.get('http://localhost:3001/api/servicios')
            .then((response) => {
                console.log('Servicios cargados para reserva:', response.data);
                const serviciosDisponibles = response.data.filter(servicio => servicio.disponible);
                setServicios(serviciosDisponibles);
            })
            .catch((error) => {
                console.error('Error al cargar servicios:', error);
                setServicios([
                    {
                        id: 1,
                        nombre: 'Servicio de Catering',
                        precio: 25000,
                        descripcion: 'Servicio de comida para eventos'
                    }
                ]);
            });

        // Inicializar el contacto con el prefijo
        setContacto('+569 ');
    }, []);

    // Efecto para limpiar el caché del clima si crece demasiado
    useEffect(() => {
        if (cacheClima.size > 50) {
            // Mantener solo las últimas 25 entradas más recientes
            const entradasOrdenadas = Array.from(cacheClima.entries())
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .slice(0, 25);

            setCacheClima(new Map(entradasOrdenadas));
            console.log('Cache del clima optimizado, entradas mantenidas:', entradasOrdenadas.length);
        }
    }, [cacheClima]);

    // Efecto para rotar el texto cada 3 segundos
    useEffect(() => {
        const intervalTexto = setInterval(() => {
            setCurrentTextIndex((prevIndex) =>
                (prevIndex + 1) % textosRotativos.length
            );
        }, 3000);

        return () => clearInterval(intervalTexto);
    }, [textosRotativos.length]);

    // Efecto mejorado para rotar el background con transición suave
    useEffect(() => {
        const intervalBackground = setInterval(() => {
            // Paso 1: Iniciar fade-out de la imagen actual
            setTransitionState('fade-out');

            setTimeout(() => {
                // Paso 2: Fade-in de la nueva imagen
                setTransitionState('fade-in');

                setTimeout(() => {
                    // Paso 3: Actualizar las variables CSS en el background
                    setCurrentBgIndex((prevIndex) => {
                        const newIndex = (prevIndex + 1) % backgroundImages.length;
                        const nextIndex = (newIndex + 1) % backgroundImages.length;

                        // Actualizar las variables CSS
                        document.documentElement.style.setProperty('--hero-bg-image', `url(${backgroundImages[newIndex]})`);
                        document.documentElement.style.setProperty('--hero-bg-image-next', `url(${backgroundImages[nextIndex]})`);

                        return newIndex;
                    });

                    // Paso 4: Completar la transición
                    setTransitionState('fade-complete');

                    setTimeout(() => {
                        // Paso 5: Resetear para la próxima transición
                        setTransitionState('idle');
                    }, 300);
                }, 1500); // Duración del crossfade
            }, 500); // Delay antes del fade-in
        }, 7000); // Intervalo total aumentado para permitir transición completa

        return () => clearInterval(intervalBackground);
    }, [backgroundImages.length]);

    // Manejar selección de servicios
    const handleServicioChange = (servicioId, isChecked) => {
        if (isChecked) {
            setServiciosSeleccionados([...serviciosSeleccionados, parseInt(servicioId)]);
        } else {
            setServiciosSeleccionados(serviciosSeleccionados.filter(id => id !== parseInt(servicioId)));
        }
    };

    // Calcular costo total estimado
    const calcularCostoEstimado = () => {
        const espacioSeleccionado = espacios.find(e => e.id.toString() === espacioId);
        const costoEspacio = espacioSeleccionado ? (espacioSeleccionado.costo_base || 0) : 0;

        const costoServicios = serviciosSeleccionados.reduce((total, servicioId) => {
            const servicio = servicios.find(s => s.id === servicioId);
            return total + (servicio ? servicio.precio : 0);
        }, 0);

        return costoEspacio + costoServicios;
    };

    // Función para validar RUT
    const validarRut = (rut) => {
        // Remover puntos y guión
        const rutLimpio = rut.replace(/[.-]/g, '');

        // Debe tener entre 8 y 9 caracteres
        if (rutLimpio.length < 8 || rutLimpio.length > 9) {
            return false;
        }

        // El último caracter puede ser número o K
        const dv = rutLimpio.slice(-1).toUpperCase();
        if (!/[0-9K]/.test(dv)) {
            return false;
        }

        return true;
    };

    // Función para validar contacto
    const validarContacto = (contacto) => {
        // Debe tener el formato +569 XXXXXXXX (exactamente 8 dígitos después del prefijo)
        const regex = /^\+569 \d{8}$/;
        return regex.test(contacto);
    };

    // Función para enviar la reserva
    const crearReserva = () => {
        // Validación de fecha antes de enviar
        if (fecha) {
            const fechaReserva = new Date(fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            fechaReserva.setHours(0, 0, 0, 0);

            if (fechaReserva <= hoy) {
                setMensaje('Solo se pueden hacer reservas para fechas futuras (a partir de mañana).');
                setStatus('error');
                return;
            }

            // Verificar si la fecha está ocupada para el espacio seleccionado
            if (esFechaOcupada(fechaReserva)) {
                setMensaje('La fecha seleccionada no está disponible para este espacio. Por favor selecciona otra fecha.');
                setStatus('error');
                return;
            }
        }

        // Validaciones antes de enviar
        if (!validarRut(rut)) {
            setMensaje('El RUT ingresado no es válido. Debe tener entre 8 y 9 dígitos.');
            setStatus('error');
            return;
        }

        if (!validarContacto(contacto)) {
            setMensaje('El número de contacto debe tener exactamente 8 dígitos después del prefijo +569.');
            setStatus('error');
            return;
        }

        if (!espacioId) {
            setMensaje('Debe seleccionar un espacio para la reserva.');
            setStatus('error');
            return;
        }

        // Validar capacidad del espacio
        const espacioSeleccionado = espacios.find(e => e.id.toString() === espacioId);
        if (espacioSeleccionado && parseInt(personas) > espacioSeleccionado.capacidad) {
            setMensaje(`La cantidad de personas (${personas}) excede la capacidad del espacio seleccionado (${espacioSeleccionado.capacidad} personas).`);
            setStatus('error');
            return;
        }

        // Validar que no se seleccionen servicios ocupados
        const serviciosConflicto = serviciosSeleccionados.filter(servicioId => serviciosOcupados.includes(servicioId));
        if (serviciosConflicto.length > 0) {
            const serviciosConflictoNombres = serviciosConflicto.map(servicioId => {
                const servicio = servicios.find(s => s.id === servicioId);
                return servicio ? servicio.nombre : `Servicio ${servicioId}`;
            });
            setMensaje(`Los siguientes servicios ya están ocupados en esta fecha: ${serviciosConflictoNombres.join(', ')}`);
            setStatus('error');
            return;
        }

        Axios.post('http://localhost:3001/api/reservas-publicas', {
            nombre: nombre,
            rut: rut,
            correo: correo,
            contacto: contacto,
            fecha: fecha,
            horario: horario,
            personas: personas,
            razon: razon,
            espacioId: espacioId,
            servicios: serviciosSeleccionados
        })
            .then((res) => {
                // Guardar datos de la reserva creada para el pago
                const espacioSeleccionado = espacios.find(e => e.id.toString() === espacioId);
                const serviciosDetalle = serviciosSeleccionados.map(servicioId => {
                    return servicios.find(s => s.id === servicioId);
                }).filter(Boolean);

                setReservaCreada({
                    reservaId: res.data.reservaId,
                    clienteNombre: nombre,
                    clienteEmail: correo,
                    razon: razon,
                    fecha: fecha,
                    personas: personas,
                    espacioId: espacioId,
                    espacioNombre: espacioSeleccionado?.nombre || 'Espacio seleccionado',
                    espacioCosto: espacioSeleccionado?.costo_base || 0,
                    serviciosSeleccionados: serviciosDetalle
                });

                // Mostrar opción de pago
                Swal.fire({
                    title: '🎉 ¡Reserva creada exitosamente!',
                    html: `
                        <div style="text-align: left; font-size: 14px;">
                            <div style="background: #e8f5e8; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                                <strong>📋 Reserva ID:</strong> ${res.data.reservaId}<br>
                                <strong>👤 Cliente:</strong> ${nombre}<br>
                                <strong>🎯 Evento:</strong> ${razon}<br>
                                <strong>📅 Fecha:</strong> ${new Date(fecha).toLocaleDateString('es-CL')}<br>
                                <strong>🏠 Espacio:</strong> ${espacioSeleccionado?.nombre || 'N/A'}<br>
                                <strong>👥 Personas:</strong> ${personas}
                            </div>
                            
                            <div style="background: #fff3e0; padding: 15px; border-radius: 10px;">
                                <strong>💰 ¿Deseas realizar el pago ahora?</strong><br>
                                <span style="color: #666;">Puedes pagar de forma segura con transferencia bancaria mediante Khipu</span>
                            </div>
                        </div>
                    `,
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: '🏦 Pagar con Khipu',
                    cancelButtonText: '⏳ Pagar después',
                    confirmButtonColor: '#4ECDC4',
                    cancelButtonColor: '#95a5a6',
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Mostrar componente de pago
                        setMostrarPagoKhipu(true);
                    } else {
                        // Usuario decidió pagar después
                        Swal.fire({
                            title: 'ℹ️ Reserva guardada',
                            text: 'Tu reserva está guardada. Puedes contactarnos para coordinar el pago.',
                            icon: 'info',
                            confirmButtonText: 'Entendido',
                            confirmButtonColor: '#4ECDC4'
                        });

                        // Limpiar formulario
                        limpiarFormulario();
                    }
                });

                setMensaje('¡Reserva creada correctamente!');
                setStatus('success');
            })
            .catch((error) => {
                console.error('Error al crear reserva:', error);
                if (error.response && error.response.data) {
                    if (error.response.data.error) {
                        setMensaje(error.response.data.error);
                        if (error.response.data.error.includes('espacio')) {
                            setMensaje('Error: No existe el espacio seleccionado. Contacte al administrador.');
                        }
                    } else if (error.response.data.details) {
                        setMensaje(`${error.response.data.error}: ${error.response.data.details}`);
                    } else if (error.response.data.sqlMessage) {
                        setMensaje(`Error en la base de datos: ${error.response.data.sqlMessage}`);
                    } else {
                        setMensaje('Error al crear la reserva.');
                    }
                } else {
                    setMensaje('Error al conectar con el servidor.');
                }
                setStatus('error');
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        crearReserva();
    };

    // Función para limpiar el formulario después de una reserva exitosa
    const limpiarFormulario = () => {
        setNombre('');
        setRut('');
        setCorreo('');
        setContacto('+569 ');
        setFecha('');
        setFechaSeleccionada(null);
        setHorario('');
        setPersonas('');
        setRazon('');
        setEspacioId('');
        setServiciosSeleccionados([]);
        setServiciosOcupados([]);
        setMostrarCalendario(false);
        setReservaCreada(null);
        setMostrarPagoKhipu(false);
    };

    // Función para manejar pago exitoso
    const manejarPagoExitoso = (datosPago) => {
        console.log('✅ Pago exitoso:', datosPago);

        // Cerrar modal de pago
        setMostrarPagoKhipu(false);
        setReservaCreada(null);

        // Limpiar formulario después del pago
        limpiarFormulario();

        // Mostrar mensaje de éxito final
        setTimeout(() => {
            Swal.fire({
                title: '🎉 ¡Todo listo!',
                text: 'Tu reserva está confirmada y el pago está en proceso. Te contactaremos pronto.',
                icon: 'success',
                confirmButtonText: 'Perfecto',
                confirmButtonColor: '#4ECDC4'
            });
        }, 1000);
    };

    // Función para cancelar el pago
    const cancelarPago = () => {
        setMostrarPagoKhipu(false);
        setReservaCreada(null);

        Swal.fire({
            title: '⏳ Pago cancelado',
            text: 'Tu reserva está guardada. Puedes contactarnos para coordinar el pago.',
            icon: 'info',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#4ECDC4'
        });

        // Limpiar formulario
        limpiarFormulario();
    };

    return (
        <React.Fragment>
            {/* Encabezado */}
            <header>
                <div className="container header-content">
                    <div className="logo" aria-label="El Patio de Lea">
                        <img
                            src={logoImage}
                            alt="Logo El Patio de Lea"
                            className="logo-image"
                        />
                        <span className="logo-text">El Patio de Lea</span>
                    </div>
                    <nav aria-label="Navegación principal">
                        <a href="#servicios">Servicios</a>
                        <a href="#reservas">Reservas</a>
                        <a href="#conoce">Conócenos</a>
                        <a href="#contacto">Contacto</a>
                        <a href="/admin-register" className="btn-admin">Vista Admin</a>
                    </nav>
                </div>
            </header>

            {/* Hero con transición crossfade mejorada */}
            <section className={`hero ${transitionState !== 'idle' ? transitionState : ''} ${transitionState !== 'idle' ? 'transitioning' : ''}`}>
                <div className="hero-transition-overlay"></div>
                <div className="hero-decorative-shapes"></div>
                <div className="overlay"></div>
                <div className="hero-content">
                    <h1>Reserva en El Patio de Lea</h1>
                    <p id="textoRotativo" aria-live="polite" className="texto-rotativo">
                        {textosRotativos[currentTextIndex]}
                    </p>
                    <a href="#reservas" className="btn btn-hero">
                        <span className="btn-text">Agendar ahora</span>
                        <span className="btn-icon">✨</span>
                    </a>
                </div>
            </section>

            {/* Servicios */}
            <section id="servicios" className="servicios container">
                <h2>Servicios que ofrecemos</h2>
                <div className="servicios-grid">
                    <div className="servicio-card">
                        <h3>Salón para eventos</h3>
                        <p>Amplio salón de madera con capacidad para 100 personas.</p>
                    </div>
                    <div className="servicio-card">
                        <h3>Atención personalizada</h3>
                        <p>Atención inmediata para un evento inolvidable.</p>
                    </div>
                    <div className="servicio-card">
                        <h3>Área al aire libre</h3>
                        <p>Jardines, quincho y zona de juegos infantiles.</p>
                    </div>
                    {servicios.length > 0 && (
                        <div className="servicio-card">
                            <h3>Servicios adicionales</h3>
                            <p>Contamos con {servicios.length} servicios complementarios disponibles.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Reservas */}
            <section id="reservas" className="reservas">
                <h2>Reserva tu fecha</h2>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre completo</label>
                        <input
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rut">RUT</label>
                        <input
                            type="text"
                            id="rut"
                            value={rut}
                            onChange={handleRutChange}
                            placeholder="12.345.678-9"
                            maxLength="12"
                            required
                        />
                        <small style={{ color: '#666', fontSize: '0.85em' }}>
                            Formato: 12.345.678-9 (máximo 9 dígitos)
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="correo">Correo electrónico</label>
                        <input
                            type="email"
                            id="correo"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contacto">Número de contacto</label>
                        <input
                            type="tel"
                            id="numero-contacto"
                            value={contacto}
                            onChange={handleContactoChange}
                            placeholder="+569 12345678"
                            maxLength="13"
                            required
                        />
                        <small style={{ color: '#666', fontSize: '0.85em' }}>
                            Formato: +569 XXXXXXXX (8 dígitos después del prefijo)
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="espacio">Espacio</label>
                        <select
                            id="espacio"
                            value={espacioId}
                            onChange={handleEspacioChange}
                            required
                            style={{
                                borderColor: !espacioId ? '#ff6b6b' : '',
                                backgroundColor: !espacioId ? 'rgba(255, 107, 107, 0.05)' : ''
                            }}
                        >
                            <option value="">Seleccione un espacio</option>
                            {espacios.map(espacio => (
                                <option key={espacio.id} value={espacio.id}>
                                    {espacio.nombre} (Cap. {espacio.capacidad} personas)
                                    {espacio.costo_base && ` - $${espacio.costo_base.toLocaleString()}`}
                                </option>
                            ))}
                        </select>
                        {cargandoDisponibilidad && (
                            <small style={{ color: '#666', fontSize: '0.85em' }}>
                                Cargando disponibilidad...
                            </small>
                        )}
                        {!espacioId && (
                            <small style={{ color: '#ff6b6b', fontSize: '0.85em', fontWeight: '500' }}>
                                ⚠️ Selecciona un espacio para continuar con tu reserva
                            </small>
                        )}
                    </div>

                    {/* Campo de fecha con calendario personalizado */}
                    <div className="form-group">
                        <label htmlFor="fecha">Fecha del evento</label>
                        <div className="fecha-input-container">
                            <input
                                type="text"
                                id="fecha"
                                value={fechaSeleccionada ? fechaSeleccionada.toLocaleDateString('es-CL') : ''}
                                placeholder="Selecciona una fecha"
                                onClick={() => setMostrarCalendario(!mostrarCalendario)}
                                readOnly
                                required
                                className="fecha-input"
                            />
                            <button
                                type="button"
                                className="btn-calendario"
                                onClick={() => setMostrarCalendario(!mostrarCalendario)}
                                disabled={!espacioId}
                            >
                                📅
                            </button>
                            {fechaSeleccionada && (
                                <button
                                    type="button"
                                    className="btn-clima"
                                    onClick={() => mostrarPronosticoClima(fechaSeleccionada)}
                                    disabled={cargandoClima}
                                    title="Ver pronóstico del clima"
                                >
                                    {cargandoClima ? '⏳' : '🌤️'}
                                </button>
                            )}
                        </div>

                        {mostrarCalendario && espacioId && (
                            <div className="calendario-container">
                                <div className="calendario-header">
                                    <h4>Selecciona tu fecha</h4>
                                    <div className="calendario-navegacion-info">
                                        <span>Usa las flechas </span>
                                        <span className="icon-navigation">‹ ›</span>
                                        <span> para navegar entre meses y </span>
                                        <span className="icon-navigation">« »</span>
                                        <span> para cambiar años</span>
                                    </div>
                                    <div className="leyenda-calendario">
                                        <div className="leyenda-item">
                                            <span className="color-disponible"></span>
                                            <span>Disponible</span>
                                        </div>
                                        <div className="leyenda-item">
                                            <span className="color-ocupado"></span>
                                            <span>Ocupado</span>
                                        </div>
                                        <div className="leyenda-item">
                                            <span className="color-no-disponible"></span>
                                            <span>No disponible (hoy)</span>
                                        </div>
                                        <div className="leyenda-item">
                                            <span className="color-seleccionado"></span>
                                            <span>Seleccionado</span>
                                        </div>
                                    </div>
                                </div>
                                <Calendar
                                    onChange={manejarSeleccionFecha}
                                    value={fechaSeleccionada}
                                    tileDisabled={esFechaDeshabilitada}
                                    tileClassName={obtenerClaseDia}
                                    locale="es-CL"
                                    minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
                                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
                                    selectRange={false}
                                    showNeighboringMonth={true}
                                    prev2Label={'«'}
                                    next2Label={'»'}
                                    prevLabel={'‹'}
                                    nextLabel={'›'}
                                    formatShortWeekday={(locale, date) =>
                                        ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()]
                                    }
                                    showNavigation={true}
                                    navigationLabel={({ date }) => `${date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`}
                                    view="month"
                                    defaultView="month"
                                />
                                <button
                                    type="button"
                                    className="btn-cerrar-calendario"
                                    onClick={() => setMostrarCalendario(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        )}

                        {!espacioId && (
                            <small style={{ color: '#ff6b6b', fontSize: '0.85em' }}>
                                ⚠️ Primero selecciona un espacio para ver la disponibilidad del calendario
                            </small>
                        )}

                        {cargandoClima && (
                            <small style={{ color: '#4ECDC4', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span>🌤️</span>
                                <span>Consultando pronóstico del clima...</span>
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="horario">Horario</label>
                        <select
                            id="horario"
                            value={horario}
                            onChange={(e) => setHorario(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un horario</option>
                            <option value="08:00">08:00 AM</option>
                            <option value="09:00">09:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="13:00">13:00 PM</option>
                            <option value="14:00">14:00 PM</option>
                            <option value="15:00">15:00 PM</option>
                            <option value="16:00">16:00 PM</option>
                            <option value="17:00">17:00 PM</option>
                            <option value="18:00">18:00 PM</option>
                            <option value="19:00">19:00 PM</option>
                            <option value="20:00">20:00 PM</option>
                            <option value="21:00">21:00 PM</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="personas">Cantidad de personas</label>
                        <input
                            type="number"
                            id="personas"
                            value={personas}
                            onChange={(e) => setPersonas(e.target.value)}
                            min="1"
                            max={espacios.find(e => e.id.toString() === espacioId)?.capacidad || 100}
                            placeholder="Ej: 50"
                            required
                        />
                        {espacioId && personas && (
                            (() => {
                                const espacioSeleccionado = espacios.find(e => e.id.toString() === espacioId);
                                const capacidadExcedida = espacioSeleccionado && parseInt(personas) > espacioSeleccionado.capacidad;

                                return (
                                    <div className={`capacidad-info ${capacidadExcedida ? 'capacidad-warning' : ''}`}>
                                        <small style={{
                                            color: capacidadExcedida ? '#856404' : '#666',
                                            fontSize: '0.85em'
                                        }}>
                                            {capacidadExcedida ? '⚠️ ' : '✓ '}
                                            Capacidad del espacio: {espacioSeleccionado?.capacidad || 0} personas
                                            {capacidadExcedida && ' (Excede la capacidad máxima)'}
                                        </small>
                                    </div>
                                );
                            })()
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="razon">Razón del evento</label>
                        <textarea
                            id="razon"
                            value={razon}
                            onChange={(e) => setRazon(e.target.value)}
                            rows="3"
                            placeholder="Ej: Cumpleaños, matrimonio, reunión, etc."
                            maxLength="100"
                            required
                        ></textarea>
                    </div>

                    {/* Sección de Servicios Adicionales */}
                    {servicios.length > 0 && (
                        <div className="form-group servicios-adicionales">
                            <label>Servicios adicionales (opcionales)</label>
                            {fecha && serviciosOcupados.length > 0 && (
                                <div className="alerta-servicios-ocupados">
                                    <small style={{ color: '#ff6b6b', fontSize: '0.85em' }}>
                                        ⚠️ Algunos servicios no están disponibles en la fecha seleccionada
                                    </small>
                                </div>
                            )}
                            <div className="servicios-checkbox-group">
                                {servicios.map(servicio => {
                                    const estaOcupado = serviciosOcupados.includes(servicio.id);
                                    return (
                                        <div key={servicio.id} className={`servicio-checkbox-item ${estaOcupado ? 'servicio-ocupado' : ''}`}>
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    value={servicio.id}
                                                    checked={serviciosSeleccionados.includes(servicio.id)}
                                                    onChange={(e) => handleServicioChange(servicio.id, e.target.checked)}
                                                    disabled={estaOcupado}
                                                />
                                                <div className="servicio-info">
                                                    <span className="servicio-nombre">
                                                        {servicio.nombre}
                                                        {estaOcupado && <span className="ocupado-badge"> (No disponible)</span>}
                                                    </span>
                                                    <span className="servicio-precio">${servicio.precio.toLocaleString()}</span>
                                                    {servicio.descripcion && (
                                                        <small className="servicio-descripcion">{servicio.descripcion}</small>
                                                    )}
                                                </div>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Resumen de costos */}
                    {(espacios.length > 0 || serviciosSeleccionados.length > 0) && (
                        <div className="form-group costo-estimado">
                            <h4>Resumen de costos estimados:</h4>
                            <div className="costo-detalle">
                                {espacios.find(e => e.id.toString() === espacioId)?.costo_base && (
                                    <div className="costo-item">
                                        <span>Espacio: </span>
                                        <span>${espacios.find(e => e.id.toString() === espacioId).costo_base.toLocaleString()}</span>
                                    </div>
                                )}
                                {serviciosSeleccionados.map(servicioId => {
                                    const servicio = servicios.find(s => s.id === servicioId);
                                    return servicio ? (
                                        <div key={servicioId} className="costo-item">
                                            <span>{servicio.nombre}: </span>
                                            <span>${servicio.precio.toLocaleString()}</span>
                                        </div>
                                    ) : null;
                                })}
                                <div className="costo-total">
                                    <strong>
                                        <span>Total estimado: </span>
                                        <span>${calcularCostoEstimado().toLocaleString()}</span>
                                    </strong>
                                </div>
                            </div>
                            <small>*Los precios son referenciales. El costo final será confirmado al procesar la reserva.</small>
                        </div>
                    )}

                    <button type="submit" className="btn">Reservar ahora</button>
                </form>

                {mensaje && (
                    <div className={`message ${status === 'success' ? 'success-message' : 'error-message'}`}>
                        {mensaje}
                    </div>
                )}


            </section>

            {/* Conócenos - Completamente rediseñado */}
            <section id="conoce">
                <div className="galeria-container">
                    <h2>Conoce nuestro espacio</h2>
                    <div className="galeria-intro">
                        <p>Descubre cada rincón de El Patio de Lea, un lugar mágico diseñado especialmente para crear momentos inolvidables con tu familia.</p>
                    </div>
                    <div className="galeria-grid">
                        <div className="galeria-item">
                            <img src={fotorefImage} alt="Vista panorámica del jardín" />
                            <div className="galeria-overlay">
                                <div className="galeria-text">
                                    <h3>Jardines Naturales</h3>
                                    <p>Amplios espacios verdes rodeados de naturaleza</p>
                                </div>
                            </div>
                        </div>
                        <div className="galeria-item">
                            <img src={saloninteriorImage} alt="Interior acogedor del salón" />
                            <div className="galeria-overlay">
                                <div className="galeria-text">
                                    <h3>Salón Principal</h3>
                                    <p>Elegante salón de madera con capacidad para 100 personas</p>
                                </div>
                            </div>
                        </div>
                        <div className="galeria-item">
                            <img src={cocinaImage} alt="Cocina completamente equipada" />
                            <div className="galeria-overlay">
                                <div className="galeria-text">
                                    <h3>Cocina Pro</h3>
                                    <p>Cocina profesional totalmente equipada</p>
                                </div>
                            </div>
                        </div>
                        <div className="galeria-item">
                            <img src={fotorefImage} alt="Área de recreación familiar" />
                            <div className="galeria-overlay">
                                <div className="galeria-text">
                                    <h3>Zona de Juegos</h3>
                                    <p>Espacio seguro y divertido para los más pequeños</p>
                                </div>
                            </div>
                        </div>
                        <div className="galeria-item">
                            <img src={campobandera} alt="Vista del campo con bandera" />
                            <div className="galeria-overlay">
                                <div className="galeria-text">
                                    <h3>Campo Abierto</h3>
                                    <p>Extensos terrenos para actividades al aire libre</p>
                                </div>
                            </div>
                        </div>
                        <div className="galeria-item">
                            <img src={campo01} alt="Área campestre 1" />
                            <div className="galeria-overlay">
                                <div className="galeria-text">
                                    <h3>Espacio Natural</h3>
                                    <p>Ambiente campestre ideal para relajarse</p>
                                </div>
                            </div>
                        </div>
                        <div className="galeria-item">
                            <img src={campo02} alt="Área campestre 2" />
                            <div className="galeria-overlay">
                                <div className="galeria-text">
                                    <h3>Paisaje Rural</h3>
                                    <p>Hermosas vistas del entorno natural</p>
                                </div>
                            </div>
                        </div>
                        <div className="galeria-item">
                            <img src={campo03} alt="Área campestre 3" />
                            <div className="galeria-overlay">
                                <div className="galeria-text">
                                    <h3>Zona Recreativa</h3>
                                    <p>Perfecta para eventos familiares y celebraciones</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Separador visual */}
            <div className="section-divider"></div>

            {/* Datos de interés - Completamente rediseñados */}
            <section className="datos-interes">
                <div className="datos-container">
                    <h2>¿Por qué elegir El Patio de Lea?</h2>
                    <div className="datos-intro">
                        <p>Conoce todas las ventajas y comodidades que hacen de nuestro centro de eventos el lugar perfecto para tu celebración.</p>
                    </div>

                    <div className="datos-grid">
                        <div className="dato-card">
                            <div className="dato-icon">🏞️</div>
                            <h3>Ubicación Privilegiada</h3>
                            <p>Ubicado en el campo, rodeado de naturaleza pura y aire fresco, lejos del ruido de la ciudad.</p>
                        </div>

                        <div className="dato-card">
                            <div className="dato-icon">🏡</div>
                            <h3>Arquitectura Única</h3>
                            <p>Hermoso salón de madera tradicional que combina elegancia rústica con comodidad moderna.</p>
                        </div>

                        <div className="dato-card">
                            <div className="dato-icon">👨‍👩‍👧‍👦</div>
                            <h3>Ideal para Familias</h3>
                            <p>Espacios diseñados pensando en la comodidad y diversión de toda la familia, especialmente los niños.</p>
                        </div>

                        <div className="dato-card">
                            <div className="dato-icon">🍽️</div>
                            <h3>Cocina Profesional</h3>
                            <p>Cocina completamente equipada disponible para que prepares tus propios platos o contrates catering.</p>
                        </div>

                        <div className="dato-card">
                            <div className="dato-icon">🎪</div>
                            <h3>Entretenimiento Completo</h3>
                            <p>Zona de quincho, juegos infantiles y amplios espacios para actividades al aire libre.</p>
                        </div>

                        <div className="dato-card">
                            <div className="dato-icon">🅿️</div>
                            <h3>Estacionamiento Amplio</h3>
                            <p>Cómodo estacionamiento para todos tus invitados sin preocupaciones de espacio.</p>
                        </div>
                    </div>

                    <div className="caracteristicas-especiales">
                        <h3>Características Especiales</h3>
                        <ul className="caracteristicas-list">
                            <li className="caracteristica-item">
                                <div className="caracteristica-icon">🌳</div>
                                <span className="caracteristica-text">Terrazas cubiertas con vista al jardín</span>
                            </li>
                            <li className="caracteristica-item">
                                <div className="caracteristica-icon">🔥</div>
                                <span className="caracteristica-text">Área de quincho totalmente equipada</span>
                            </li>
                            <li className="caracteristica-item">
                                <div className="caracteristica-icon">🎠</div>
                                <span className="caracteristica-text">Zona de juegos segura para niños</span>
                            </li>
                            <li className="caracteristica-item">
                                <div className="caracteristica-icon">🏐</div>
                                <span className="caracteristica-text">Espacios amplios para actividades deportivas</span>
                            </li>
                            <li className="caracteristica-item">
                                <div className="caracteristica-icon">🎵</div>
                                <span className="caracteristica-text">Sistema de sonido profesional</span>
                            </li>
                            <li className="caracteristica-item">
                                <div className="caracteristica-icon">💡</div>
                                <span className="caracteristica-text">Iluminación LED ambiente configurable</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Contacto */}
            <section id="contacto" className="contacto">
                <h2>Contacto</h2>
                <p>Para más información, llámanos al <a href="tel:+56912345678">+56 9 1234 5678</a> o escríbenos a <a href="mailto:contacto@eventoscanete.cl">contacto@eventoscanete.cl</a>.</p>
            </section>

            {/* Pie de página */}
            <footer>
                <p>&copy; 2025 El Patio de Lea. Todos los derechos reservados.</p>
            </footer>

            {/* Modal de pago con Khipu */}
            {mostrarPagoKhipu && reservaCreada && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <PagoKhipu
                            reservaData={reservaCreada}
                            onPagoExitoso={manejarPagoExitoso}
                            onCancelar={cancelarPago}
                        />
                    </div>
                </div>
            )}
        </React.Fragment>
    );
}

export default Front;