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
            const mockData = [
                {
                    id: 1,
                    clienteId: 1,
                    clienteNombre: 'María González',
                    espacioId: 1,
                    espacioNombre: 'Salón Principal',
                    fechaEvento: '2025-06-20',
                    horaInicio: '18:00',
                    horaFin: '23:00',
                    tipoEvento: 'Cumpleaños',
                    numeroPersonas: 85,
                    serviciosSeleccionados: [1, 2],
                    serviciosNombres: ['Catering Premium', 'Decoración Temática'],
                    estado: 'confirmada',
                    fechaCreacion: '2025-05-15',
                    observaciones: 'Cumpleaños de 50 años, decoración en dorado',
                    costoEspacio: 380000,
                    costoServicios: 630000,
                    descuento: 50000,
                    costoTotal: 960000,
                    anticipo: 480000,
                    saldoPendiente: 480000
                },
                {
                    id: 2,
                    clienteId: 2,
                    clienteNombre: 'Carlos Pérez',
                    espacioId: 2,
                    espacioNombre: 'Salón VIP',
                    fechaEvento: '2025-07-05',
                    horaInicio: '19:00',
                    horaFin: '01:00',
                    tipoEvento: 'Evento Corporativo',
                    numeroPersonas: 45,
                    serviciosSeleccionados: [3, 4],
                    serviciosNombres: ['Sistema de Sonido', 'Fotografía Profesional'],
                    estado: 'pendiente',
                    fechaCreacion: '2025-06-01',
                    observaciones: 'Cena de fin de año empresa',
                    costoEspacio: 550000,
                    costoServicios: 570000,
                    descuento: 0,
                    costoTotal: 1120000,
                    anticipo: 300000,
                    saldoPendiente: 820000
                },
                {
                    id: 3,
                    clienteId: 3,
                    clienteNombre: 'Ana López',
                    espacioId: 4,
                    espacioNombre: 'Sala de Reuniones',
                    fechaEvento: '2025-06-15',
                    horaInicio: '15:00',
                    horaFin: '19:00',
                    tipoEvento: 'Baby Shower',
                    numeroPersonas: 20,
                    serviciosSeleccionados: [2],
                    serviciosNombres: ['Decoración Temática'],
                    estado: 'completada',
                    fechaCreacion: '2025-05-20',
                    observaciones: 'Baby shower íntimo',
                    costoEspacio: 150000,
                    costoServicios: 180000,
                    descuento: 0,
                    costoTotal: 330000,
                    anticipo: 330000,
                    saldoPendiente: 0
                }
            ];
            setReservas(mockData);
        } catch (error) {
            console.error('Error cargando reservas:', error);
        }
    };

    const loadClientes = async () => {
        const mockClientes = [
            { id: 1, nombre: 'María González' },
            { id: 2, nombre: 'Carlos Pérez' },
            { id: 3, nombre: 'Ana López' }
        ];
        setClientes(mockClientes);
    };

    const loadEspacios = async () => {
        const mockEspacios = [
            { id: 1, nombre: 'Salón Principal', capacidad: 120, costo: 380000 },
            { id: 2, nombre: 'Salón VIP', capacidad: 60, costo: 550000 },
            { id: 3, nombre: 'Terraza Jardín', capacidad: 80, costo: 280000 },
            { id: 4, nombre: 'Sala de Reuniones', capacidad: 25, costo: 150000 }
        ];
        setEspacios(mockEspacios);
    };

    const loadServicios = async () => {
        const mockServicios = [
            { id: 1, nombre: 'Catering Premium', precio: 450000 },
            { id: 2, nombre: 'Decoración Temática', precio: 180000 },
            { id: 3, nombre: 'Sistema de Sonido', precio: 250000 },
            { id: 4, nombre: 'Fotografía Profesional', precio: 320000 }
        ];
        setServicios(mockServicios);
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
            const costoTotal = calcularCostoTotal();
            const datosReserva = {
                ...formData,
                costoTotal,
                saldoPendiente: costoTotal - (formData.anticipo || 0)
            };

            if (selectedReserva) {
                console.log('Actualizando reserva:', datosReserva);
            } else {
                console.log('Creando nueva reserva:', datosReserva);
            }
            closeModal();
            loadReservas();
        } catch (error) {
            console.error('Error al guardar reserva:', error);
        }
    };

    const openModal = (reserva = null) => {
        if (reserva) {
            setSelectedReserva(reserva);
            setFormData({
                clienteId: reserva.clienteId,
                espacioId: reserva.espacioId,
                fechaEvento: reserva.fechaEvento,
                horaInicio: reserva.horaInicio,
                horaFin: reserva.horaFin,
                tipoEvento: reserva.tipoEvento,
                numeroPersonas: reserva.numeroPersonas,
                serviciosSeleccionados: reserva.serviciosSeleccionados,
                estado: reserva.estado,
                observaciones: reserva.observaciones,
                descuento: reserva.descuento,
                anticipo: reserva.anticipo
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
            loadReservas();
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        }
    };

    const filteredReservas = reservas.filter(reserva => {
        const matchesSearch = reserva.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reserva.espacioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reserva.tipoEvento.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'todas' || reserva.estado === filterStatus;

        return matchesSearch && matchesStatus;
    });

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
                                            <strong>{reserva.clienteNombre}</strong>
                                            <br />
                                            <small>{reserva.tipoEvento} - {reserva.numeroPersonas} personas</small>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{reserva.espacioNombre}</strong>
                                        <br />
                                        <small>{reserva.serviciosNombres.join(', ')}</small>
                                    </td>
                                    <td>
                                        <div>
                                            <strong>{new Date(reserva.fechaEvento).toLocaleDateString()}</strong>
                                            <br />
                                            <small>{reserva.horaInicio} - {reserva.horaFin}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${estadosReserva.find(e => e.value === reserva.estado)?.color}`}>
                                            {estadosReserva.find(e => e.value === reserva.estado)?.label}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>${reserva.costoTotal.toLocaleString()}</strong>
                                        <br />
                                        <small>Anticipo: ${reserva.anticipo.toLocaleString()}</small>
                                    </td>
                                    <td>
                                        <strong className={reserva.saldoPendiente > 0 ? 'text-danger' : 'text-success'}>
                                            ${reserva.saldoPendiente.toLocaleString()}
                                        </strong>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-view">👁️</button>
                                            <button className="btn-edit" onClick={() => openModal(reserva)}>✏️</button>
                                            {reserva.estado === 'pendiente' && (
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => cambiarEstadoReserva(reserva.id, 'confirmada')}
                                                >
                                                    ✅
                                                </button>
                                            )}
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