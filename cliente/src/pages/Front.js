import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import '../styles/Front.css'; // Asegúrate de tener este archivo CSS
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

    // Estados para animaciones del hero con transición mejorada
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const [transitionState, setTransitionState] = useState('idle'); // 'idle', 'fade-out', 'fade-in', 'fade-complete'

    // Arrays para rotación
    const textosRotativos = [
        "Asegura tu lugar con nosotros",
        "Crea momentos inolvidables",
        "Vive experiencias únicas",
        "Tu evento perfecto te espera",
        "Donde los sueños se hacen realidad"
    ];

    const backgroundImages = [bgImage, bgImage2];

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
                    // Establecer el primer espacio como seleccionado por defecto
                    setEspacioId(response.data[0].id.toString());
                } else {
                    console.log('No hay espacios disponibles');
                    // Si no hay espacios, crear uno por defecto
                    crearEspacioPorDefecto();
                }
            })
            .catch((error) => {
                console.error('Error al cargar espacios:', error);
                // En caso de error, intentar crear un espacio por defecto
                crearEspacioPorDefecto();
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


    // Función para crear un espacio por defecto si no existen
    const crearEspacioPorDefecto = () => {
        Axios.post('http://localhost:3001/crearEspacio', {
            nombre: 'Salón Principal',
            capacidad: 100,
            costo_base: 50000,
            descripcion: 'Salón principal para eventos'
        })
            .then((response) => {
                console.log('Espacio por defecto creado');
                const nuevoEspacio = {
                    id: response.data.id,
                    nombre: 'Salón Principal',
                    capacidad: 100,
                    costo_base: 50000
                };
                setEspacios([nuevoEspacio]);
                setEspacioId(response.data.id.toString());
            })
            .catch((error) => {
                console.error('Error al crear espacio por defecto:', error);
                // Crear un espacio temporal para que la aplicación no falle
                const espacioTemporal = {
                    id: 1,
                    nombre: 'Salón Principal (Temporal)',
                    capacidad: 100,
                    costo_base: 50000
                };
                setEspacios([espacioTemporal]);
                setEspacioId('1');
            });
    };

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
                setMensaje('¡Reserva creada correctamente!');
                setStatus('success');
                // Limpiar campos después de una reserva exitosa
                setNombre('');
                setRut('');
                setCorreo('');
                setContacto('+569 '); // Resetear con el prefijo
                setFecha('');
                setHorario('');
                setPersonas('');
                setRazon('');
                setEspacioId(espacios.length > 0 ? espacios[0].id.toString() : '');
                setServiciosSeleccionados([]);
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
                        <label htmlFor="fecha">Fecha del evento</label>
                        <input
                            type="date"
                            id="fecha"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
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
                        <label htmlFor="espacio">Espacio</label>
                        <select
                            id="espacio"
                            value={espacioId}
                            onChange={(e) => setEspacioId(e.target.value)}
                            required
                        >
                            <option value="">Seleccione un espacio</option>
                            {espacios.map(espacio => (
                                <option key={espacio.id} value={espacio.id}>
                                    {espacio.nombre} (Cap. {espacio.capacidad} personas)
                                    {espacio.costo_base && ` - $${espacio.costo_base.toLocaleString()}`}
                                </option>
                            ))}
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
                            max="100"
                            placeholder="Ej: 50"
                            required
                        />
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
                            <div className="servicios-checkbox-group">
                                {servicios.map(servicio => (
                                    <div key={servicio.id} className="servicio-checkbox-item">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                value={servicio.id}
                                                checked={serviciosSeleccionados.includes(servicio.id)}
                                                onChange={(e) => handleServicioChange(servicio.id, e.target.checked)}
                                            />
                                            <div className="servicio-info">
                                                <span className="servicio-nombre">{servicio.nombre}</span>
                                                <span className="servicio-precio">${servicio.precio.toLocaleString()}</span>
                                                {servicio.descripcion && (
                                                    <small className="servicio-descripcion">{servicio.descripcion}</small>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                ))}
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
        </React.Fragment>
    );
}

export default Front;