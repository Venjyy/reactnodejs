import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import '../styles/Front.css'; // Asegúrate de tener este archivo CSS
import bgImage from '../assets/images/bg.jpg';
import fotorefImage from '../assets/images/fotoref.png';
import saloninteriorImage from '../assets/images/saloninterior.jpg';
import cocinaImage from '../assets/images/cocina.jfif';
import logoImage from '../assets/images/logo.png';

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
    const [espacioId, setEspacioId] = useState('1');
    const [espacios, setEspacios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
    const [mensaje, setMensaje] = useState('');
    const [status, setStatus] = useState('');

    // Cargar espacios y servicios disponibles al cargar el componente
    useEffect(() => {
        // Aplicar imagen de fondo dinámicamente
        document.documentElement.style.setProperty('--hero-bg-image', `url(${bgImage})`);

        // Cargar espacios
        Axios.get('http://localhost:3001/espacios')
            .then((response) => {
                if (response.data.length > 0) {
                    setEspacios(response.data);
                    setEspacioId(response.data[0].id.toString());
                } else {
                    console.log('No hay espacios disponibles');
                    crearEspacioPorDefecto();
                }
            })
            .catch((error) => {
                console.error('Error al cargar espacios:', error);
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
    }, []);

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
                setEspacios([{
                    id: response.data.id,
                    nombre: 'Salón Principal',
                    capacidad: 100
                }]);
                setEspacioId(response.data.id.toString());
            })
            .catch((error) => {
                console.error('Error al crear espacio por defecto:', error);
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
        const costoEspacio = espacioSeleccionado ? espacioSeleccionado.costo_base || 0 : 0;

        const costoServicios = serviciosSeleccionados.reduce((total, servicioId) => {
            const servicio = servicios.find(s => s.id === servicioId);
            return total + (servicio ? servicio.precio : 0);
        }, 0);

        return costoEspacio + costoServicios;
    };

    // Función para enviar la reserva
    const crearReserva = () => {
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
            servicios: serviciosSeleccionados // Agregar servicios seleccionados
        })
            .then((res) => {
                setMensaje('¡Reserva creada correctamente!');
                setStatus('success');
                // Limpiar campos después de una reserva exitosa
                setNombre('');
                setRut('');
                setCorreo('');
                setContacto('');
                setFecha('');
                setHorario('');
                setPersonas('');
                setRazon('');
                setEspacioId('1');
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

            {/* Hero */}
            <section className="hero">
                <div className="overlay"></div>
                <div className="hero-content">
                    <h1>Reserva en El Patio de Lea</h1>
                    <p id="textoRotativo" aria-live="polite">Asegura tu lugar con nosotros</p>
                    <a href="#reservas" className="btn">Agendar ahora</a>
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
                            onChange={(e) => setRut(e.target.value)}
                            placeholder="12.345.678-9"
                            required
                        />
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
                            id="contacto"
                            value={contacto}
                            onChange={(e) => setContacto(e.target.value)}
                            placeholder="+56 9 1234 5678"
                            required
                        />
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
                            {espacios.length > 0 ? (
                                espacios.map(espacio => (
                                    <option key={espacio.id} value={espacio.id}>
                                        {espacio.nombre} (Cap. {espacio.capacidad} personas)
                                        {espacio.costo_base && ` - $${espacio.costo_base.toLocaleString()}`}
                                    </option>
                                ))
                            ) : (
                                <option value="1">Salón Principal (Predeterminado)</option>
                            )}
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