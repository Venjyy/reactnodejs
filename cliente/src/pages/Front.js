import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './Front'; // Asegúrate de tener este archivo CSS

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
    const [mensaje, setMensaje] = useState('');
    const [status, setStatus] = useState('');

    // Cargar espacios disponibles al cargar el componente
    useEffect(() => {
        // Intentar obtener los espacios disponibles
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

    // Función para enviar la reserva
    const crearReserva = () => {
        Axios.post('http://localhost:3001/crearReserva', {
            nombre: nombre,
            rut: rut,
            correo: correo,
            contacto: contacto,
            fecha: fecha,
            horario: horario,
            personas: personas,
            razon: razon,
            espacioId: espacioId
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
                    <div className="logo" aria-label="Centro de Eventos Cañete">Centro de Eventos Cañete</div>
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
                    <h1>Reserva tu evento ideal en Cañete</h1>
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
                            <option value="13:00">01:00 PM</option>
                            <option value="14:00">02:00 PM</option>
                            <option value="15:00">03:00 PM</option>
                            <option value="16:00">04:00 PM</option>
                            <option value="17:00">05:00 PM</option>
                            <option value="18:00">06:00 PM</option>
                            <option value="19:00">07:00 PM</option>
                            <option value="20:00">08:00 PM</option>
                            <option value="21:00">09:00 PM</option>
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

                    <button type="submit" className="btn">Reservar ahora</button>
                </form>

                {mensaje && (
                    <div className={`message ${status === 'success' ? 'success-message' : 'error-message'}`}>
                        {mensaje}
                    </div>
                )}
            </section>

            {/* Conócenos */}
            <section id="conoce" className="servicios container">
                <h2>Conoce el lugar</h2>
                <div className="galeria-grid">
                    <img src="/images/fotoref.png" alt="Vista del jardín" />
                    <img src="/images/saloninterior.jpg" alt="Interior del salón de eventos" />
                    <img src="/images/cocina.jfif" alt="Área de cocina equipada" />
                    <img src="/images/fotoref.png" alt="Terraza al aire libre" />
                </div>
            </section>

            {/* Datos de interés */}
            <section className="datos-interes container">
                <h2>Datos de interés</h2>
                <ul>
                    <li>Ubicado en el campo, rodeado de naturaleza.</li>
                    <li>Espacios al aire libre y terrazas cubiertas.</li>
                    <li>Salón de eventos de madera tradicional.</li>
                    <li>Cocina equipada disponible para arriendo.</li>
                    <li>Zona de quincho y juegos infantiles.</li>
                </ul>
            </section>

            {/* Contacto */}
            <section id="contacto" className="contacto">
                <h2>Contacto</h2>
                <p>Para más información, llámanos al <a href="tel:+56912345678">+56 9 1234 5678</a> o escríbenos a <a href="mailto:contacto@eventoscanete.cl">contacto@eventoscanete.cl</a>.</p>
            </section>

            {/* Pie de página */}
            <footer>
                <p>&copy; 2025 Centro de Eventos Cañete. Todos los derechos reservados.</p>
            </footer>
        </React.Fragment>
    );
}

export default Front;