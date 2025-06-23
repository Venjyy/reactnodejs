import React, { useState, useEffect } from 'react';
import './Sections.css';

function Reservas() {
    const [reservas, setReservas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [espacios, setEspacios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todas');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [formData, setFormData] = useState({
        clienteId: '',
        espacioId: '',
        fechaEvento: '',
        horaInicio: '',
        horaFin: '',
        tipoEvento: '',
        numeroPersonas: '',
        serviciosSeleccionados: [],
        estado: 'pendiente',
        observaciones: '',
        descuento: 0,
        anticipo: 0
    });

    const estadosReserva = [
        { value: 'pendiente', label: 'Pendiente', color: 'warning' },
        { value: 'confirmada', label: 'Confirmada', color: 'success' },
        { value: 'cancelada', label: 'Cancelada', color: 'danger' },
        { value: 'completada', label: 'Completada', color: 'info' }
    ];

    const tiposEvento = [
        'Cumpleaños',
        'Baby Shower',
        'Matrimonio',
        'Aniversario',
        'Reunión Familiar',
        'Evento Corporativo',
        'Graduación',
        'Quinceaños',
        'Bautizo',
        'Otro'
    ];

    useEffect(() => {
        loadReservas();
        loadClientes();
        loadEspacios();
        loadServicios();
    }, []);


    const loadReservas = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/reservas');
            if (response.ok) {
                const data = await response.json();
                console.log('Datos de reservas recibidos:', data);
                setReservas(data);
                console.log('Reservas cargadas desde BD:', data.length);
            } else {
                console.error('Error al cargar reservas:', response.statusText);
                const errorData = await response.json();
                console.error('Detalles del error:', errorData);
                setReservas([]);
            }
        } catch (error) {
            console.error('Error cargando reservas:', error);
            setReservas([]);
        }
    };

    const loadClientes = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/reservas/clientes');
            if (response.ok) {
                const data = await response.json();
                setClientes(data);
                console.log('Clientes cargados desde BD:', data.length);
            } else {
                const mockClientes = [
                    { id: 1, nombre: 'María González' },
                    { id: 2, nombre: 'Carlos Pérez' },
                    { id: 3, nombre: 'Ana López' }
                ];
                setClientes(mockClientes);
            }
        } catch (error) {
            console.error('Error cargando clientes:', error);
            setClientes([]);
        }
    };

    const loadEspacios = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/reservas/espacios');
            if (response.ok) {
                const data = await response.json();
                setEspacios(data);
                console.log('Espacios cargados desde BD:', data.length);
            } else {
                const mockEspacios = [
                    { id: 1, nombre: 'Salón Principal', capacidad: 120, costo: 380000 },
                    { id: 2, nombre: 'Salón VIP', capacidad: 60, costo: 550000 },
                    { id: 3, nombre: 'Terraza Jardín', capacidad: 80, costo: 280000 },
                    { id: 4, nombre: 'Sala de Reuniones', capacidad: 25, costo: 150000 }
                ];
                setEspacios(mockEspacios);
            }
        } catch (error) {
            console.error('Error cargando espacios:', error);
            setEspacios([]);
        }
    };
    const eliminarReserva = async (id, clienteNombre, espacioNombre) => {
        const confirmacion = window.confirm(
            `¿Estás seguro de que deseas eliminar la reserva de ${clienteNombre} en ${espacioNombre}?\n\nEsta acción no se puede deshacer.`
        );

        if (!confirmacion) {
            return;
        }

        try {
            console.log('Eliminando reserva:', id);

            const response = await fetch(`http://localhost:3001/api/reservas/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Reserva eliminada correctamente:', result);
                loadReservas(); // Recargar la lista
                alert('Reserva eliminada correctamente');
            } else {
                const errorData = await response.json();
                console.error('Error al eliminar reserva:', errorData.error);
                alert(errorData.error || 'Error al eliminar la reserva');
            }
        } catch (error) {
            console.error('Error al eliminar reserva:', error);
            alert('Error de conexión al eliminar la reserva');
        }
    };
    const loadServicios = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/reservas/servicios');
            if (response.ok) {
                const data = await response.json();
                setServicios(data);
                console.log('Servicios cargados desde BD:', data.length);
            } else {
                const mockServicios = [
                    { id: 1, nombre: 'Catering Premium', precio: 450000 },
                    { id: 2, nombre: 'Decoración Temática', precio: 180000 },
                    { id: 3, nombre: 'Sistema de Sonido', precio: 250000 },
                    { id: 4, nombre: 'Fotografía Profesional', precio: 320000 }
                ];
                setServicios(mockServicios);
            }
        } catch (error) {
            console.error('Error cargando servicios:', error);
            setServicios([]);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleServicioChange = (servicioId) => {
        const serviciosActuales = formData.serviciosSeleccionados;
        const nuevoArray = serviciosActuales.includes(servicioId)
            ? serviciosActuales.filter(id => id !== servicioId)
            : [...serviciosActuales, servicioId];

        setFormData({
            ...formData,
            serviciosSeleccionados: nuevoArray
        });
    };

    const calcularCostoTotal = () => {
        const espacioSeleccionado = espacios.find(e => e.id === parseInt(formData.espacioId));
        const costoEspacio = espacioSeleccionado ? espacioSeleccionado.costo : 0;

        const costoServicios = formData.serviciosSeleccionados.reduce((total, servicioId) => {
            const servicio = servicios.find(s => s.id === servicioId);
            return total + (servicio ? servicio.precio : 0);
        }, 0);

        return costoEspacio + costoServicios - (formData.descuento || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const costoTotal = calcularCostoTotal(); // Línea 199 - ahora SÍ se usará
            const datosReserva = {
                clienteId: parseInt(formData.clienteId),
                espacioId: parseInt(formData.espacioId),
                fechaEvento: formData.fechaEvento,
                horaInicio: formData.horaInicio,
                horaFin: formData.horaFin,
                tipoEvento: formData.tipoEvento,
                numeroPersonas: parseInt(formData.numeroPersonas),
                serviciosSeleccionados: formData.serviciosSeleccionados,
                estado: formData.estado,
                observaciones: formData.observaciones,
                descuento: parseFloat(formData.descuento) || 0,
                anticipo: parseFloat(formData.anticipo) || 0,
                costoTotal: costoTotal // AGREGAR ESTA LÍNEA - usar la variable calculada
            };

            const url = selectedReserva
                ? `http://localhost:3001/api/reservas/${selectedReserva.id}`
                : 'http://localhost:3001/api/reservas';

            const method = selectedReserva ? 'PUT' : 'POST';

            console.log('Enviando datos de reserva:', datosReserva);
            console.log('Costo total calculado:', costoTotal); // También usar aquí para logging

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosReserva)
            });

            if (response.ok) {
                const result = await response.json();
                console.log(selectedReserva ? 'Reserva actualizada:' : 'Reserva creada:', result);
                closeModal();
                loadReservas(); // Recargar la lista
            } else {
                const errorData = await response.json();
                console.error('Error al guardar reserva:', errorData.error);
                alert(errorData.error || 'Error al guardar la reserva');
            }
        } catch (error) {
            console.error('Error al guardar reserva:', error);
            alert('Error de conexión al guardar la reserva');
        }
    };

    const openModal = (reserva = null) => {
        if (reserva) {
            setSelectedReserva(reserva);

            // Procesar la fecha correctamente
            let fechaFormateada = '';
            if (reserva.fechaEvento) {
                // Si ya viene en formato YYYY-MM-DD, usarla directamente
                if (typeof reserva.fechaEvento === 'string' && reserva.fechaEvento.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    fechaFormateada = reserva.fechaEvento;
                } else {
                    // Si viene como timestamp o fecha completa, convertirla
                    const fecha = new Date(reserva.fechaEvento);
                    if (!isNaN(fecha.getTime())) {
                        fechaFormateada = fecha.toISOString().split('T')[0];
                    }
                }
            }

            setFormData({
                clienteId: reserva.clienteId || '',
                espacioId: reserva.espacioId || '',
                fechaEvento: fechaFormateada,
                horaInicio: reserva.horaInicio || '',
                horaFin: reserva.horaFin || '',
                tipoEvento: reserva.tipoEvento || '',
                numeroPersonas: reserva.numeroPersonas || '',
                serviciosSeleccionados: reserva.serviciosSeleccionados || [],
                estado: reserva.estado || 'pendiente',
                observaciones: reserva.observaciones || '',
                descuento: reserva.descuento || 0,
                anticipo: reserva.anticipo || 0
            });
        } else {
            setSelectedReserva(null);
            setFormData({
                clienteId: '',
                espacioId: '',
                fechaEvento: '',
                horaInicio: '',
                horaFin: '',
                tipoEvento: '',
                numeroPersonas: '',
                serviciosSeleccionados: [],
                estado: 'pendiente',
                observaciones: '',
                descuento: 0,
                anticipo: 0
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReserva(null);
    };

    const cambiarEstadoReserva = async (id, nuevoEstado) => {
        try {
            console.log('Cambiando estado de reserva:', id, 'a:', nuevoEstado);

            const response = await fetch(`http://localhost:3001/api/reservas/${id}/estado`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Estado cambiado correctamente:', result);
                loadReservas(); // Recargar la lista
            } else {
                const errorData = await response.json();
                console.error('Error al cambiar estado:', errorData.error);
                alert(errorData.error || 'Error al cambiar el estado');
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            alert('Error de conexión al cambiar el estado');
        }
    };

    const filteredReservas = reservas.filter(reserva => {
        const matchesSearch = (reserva.clienteNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reserva.espacioNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reserva.tipoEvento || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'todas' || reserva.estado === filterStatus;

        return matchesSearch && matchesStatus;
    });

    console.log('Total reservas:', reservas.length);
    console.log('Reservas filtradas:', filteredReservas.length);
    console.log('Término de búsqueda:', searchTerm);
    console.log('Filtro de estado:', filterStatus);

    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-content">
                    <h1>
                        <span className="section-icon">📅</span>
                        Gestión de Reservas
                    </h1>
                    <p>Administra todas las reservas del sistema</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <span>➕</span>
                    Nueva Reserva
                </button>
            </div>

            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>{reservas.length}</h3>
                        <p>Total Reservas</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">⏳</span>
                    <div>
                        <h3>{reservas.filter(r => r.estado === 'pendiente').length}</h3>
                        <p>Pendientes</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">✅</span>
                    <div>
                        <h3>{reservas.filter(r => r.estado === 'confirmada').length}</h3>
                        <p>Confirmadas</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <div>
                        <h3>${reservas.reduce((sum, r) => sum + r.costoTotal, 0).toLocaleString()}</h3>
                        <p>Ingresos Totales</p>
                    </div>
                </div>
            </div>

            <div className="section-content">
                <div className="content-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, espacio o tipo de evento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="search-input"
                        style={{ maxWidth: '200px' }}
                    >
                        <option value="todas">Todos los estados</option>
                        {estadosReserva.map(estado => (
                            <option key={estado.value} value={estado.value}>
                                {estado.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente & Evento</th>
                                <th>Espacio</th>
                                <th>Fecha & Hora</th>
                                <th>Estado</th>
                                <th>Costo</th>
                                <th>Saldo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReservas.map(reserva => (
                                <tr key={reserva.id}>
                                    <td>
                                        <div>
                                            <strong>{reserva.clienteNombre || 'Cliente no disponible'}</strong>
                                            <br />
                                            <small>
                                                {reserva.tipoEvento || 'Tipo no especificado'} - {reserva.numeroPersonas || 0} personas
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{reserva.espacioNombre || 'Espacio no disponible'}</strong>
                                        <br />
                                        <small>
                                            {reserva.serviciosNombres && reserva.serviciosNombres.length > 0
                                                ? reserva.serviciosNombres.join(', ')
                                                : 'Sin servicios adicionales'
                                            }
                                        </small>
                                    </td>

                                    <td>
                                        <div>
                                            <strong>
                                                {reserva.fechaEvento ? (
                                                    (() => {
                                                        try {
                                                            // Si fechaEvento ya es una fecha válida en formato YYYY-MM-DD
                                                            if (typeof reserva.fechaEvento === 'string' && reserva.fechaEvento.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                                                const [year, month, day] = reserva.fechaEvento.split('-');
                                                                return `${day}/${month}/${year}`;
                                                            }
                                                            // Si es un timestamp o fecha completa
                                                            const fecha = new Date(reserva.fechaEvento);
                                                            if (!isNaN(fecha.getTime())) {
                                                                return fecha.toLocaleDateString('es-CL');
                                                            }
                                                            return 'Fecha inválida';
                                                        } catch (error) {
                                                            console.error('Error al formatear fecha:', error, reserva.fechaEvento);
                                                            return 'Fecha inválida';
                                                        }
                                                    })()
                                                ) : (
                                                    'Fecha no disponible'
                                                )}
                                            </strong>
                                            <br />
                                            <small>{reserva.horaInicio || '--:--'} - {reserva.horaFin || '--:--'}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${estadosReserva.find(e => e.value === reserva.estado)?.color || 'secondary'}`}>
                                            {estadosReserva.find(e => e.value === reserva.estado)?.label || reserva.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>${(reserva.costoTotal || 0).toLocaleString('es-CL')}</strong>
                                        <br />
                                        <small>Anticipo: ${(reserva.anticipo || 0).toLocaleString('es-CL')}</small>
                                    </td>
                                    <td>
                                        <strong className={(reserva.saldoPendiente || 0) > 0 ? 'text-danger' : 'text-success'}>
                                            ${(reserva.saldoPendiente || 0).toLocaleString('es-CL')}
                                        </strong>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-view" title="Ver detalles">👁️</button>
                                            <button className="btn-edit" onClick={() => openModal(reserva)} title="Editar">✏️</button>
                                            {reserva.estado === 'pendiente' && (
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => cambiarEstadoReserva(reserva.id, 'confirmada')}
                                                    title="Confirmar reserva"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            <button
                                                className="btn-delete"
                                                onClick={() => eliminarReserva(
                                                    reserva.id,
                                                    reserva.clienteNombre,
                                                    reserva.espacioNombre
                                                )}
                                                title="Eliminar reserva"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal modal-large">
                        <div className="modal-header">
                            <h2>{selectedReserva ? 'Editar Reserva' : 'Nueva Reserva'}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Cliente</label>
                                        <select
                                            name="clienteId"
                                            value={formData.clienteId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Seleccionar cliente</option>
                                            {clientes.map(cliente => (
                                                <option key={cliente.id} value={cliente.id}>
                                                    {cliente.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Espacio</label>
                                        <select
                                            name="espacioId"
                                            value={formData.espacioId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Seleccionar espacio</option>
                                            {espacios.map(espacio => (
                                                <option key={espacio.id} value={espacio.id}>
                                                    {espacio.nombre} - ${espacio.costo.toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Fecha del Evento</label>
                                        <input
                                            type="date"
                                            name="fechaEvento"
                                            value={formData.fechaEvento}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tipo de Evento</label>
                                        <select
                                            name="tipoEvento"
                                            value={formData.tipoEvento}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Seleccionar tipo</option>
                                            {tiposEvento.map(tipo => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Hora de Inicio</label>
                                        <input
                                            type="time"
                                            name="horaInicio"
                                            value={formData.horaInicio}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Hora de Fin</label>
                                        <input
                                            type="time"
                                            name="horaFin"
                                            value={formData.horaFin}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Número de Personas</label>
                                        <input
                                            type="number"
                                            name="numeroPersonas"
                                            value={formData.numeroPersonas}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado</label>
                                        <select
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            {estadosReserva.map(estado => (
                                                <option key={estado.value} value={estado.value}>
                                                    {estado.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Servicios Adicionales</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {servicios.map(servicio => (
                                            <label key={servicio.id} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.serviciosSeleccionados.includes(servicio.id)}
                                                    onChange={() => handleServicioChange(servicio.id)}
                                                />
                                                {servicio.nombre} - ${servicio.precio.toLocaleString()}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Descuento ($)</label>
                                        <input
                                            type="number"
                                            name="descuento"
                                            value={formData.descuento}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Anticipo ($)</label>
                                        <input
                                            type="number"
                                            name="anticipo"
                                            value={formData.anticipo}
                                            onChange={handleInputChange}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Observaciones</label>
                                    <textarea
                                        name="observaciones"
                                        value={formData.observaciones}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Información adicional sobre la reserva..."
                                    />
                                </div>
                                <div className="form-group">
                                    <strong>Costo Total Estimado: ${calcularCostoTotal().toLocaleString()}</strong>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {selectedReserva ? 'Actualizar' : 'Crear'} Reserva
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reservas;