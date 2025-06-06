import React, { useState, useEffect } from 'react';
import './Sections.css'; // Asegúrate de tener este archivo CSS para estilos

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        rut: '',
        email: '',
        telefono: '',
        direccion: '',
        fechaNacimiento: '',
        tipoCliente: 'particular',
        empresa: '',
        observaciones: ''
    });

    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        try {
            const mockData = [
                {
                    id: 1,
                    nombre: 'María',
                    apellido: 'González',
                    rut: '12.345.678-9',
                    email: 'maria.gonzalez@email.com',
                    telefono: '+56 9 8765 4321',
                    direccion: 'Av. Principal 123, Santiago',
                    fechaNacimiento: '1985-03-15',
                    tipoCliente: 'particular',
                    empresa: '',
                    observaciones: 'Cliente VIP',
                    fechaRegistro: '2024-01-15',
                    totalReservas: 8,
                    ultimaReserva: '2025-05-20'
                },
                {
                    id: 2,
                    nombre: 'Carlos',
                    apellido: 'Pérez',
                    rut: '98.765.432-1',
                    email: 'carlos.perez@empresa.cl',
                    telefono: '+56 9 1234 5678',
                    direccion: 'Calle Comercial 456, Valparaíso',
                    fechaNacimiento: '1978-11-28',
                    tipoCliente: 'empresa',
                    empresa: 'Eventos Corporativos SpA',
                    observaciones: 'Contacto preferencial vía email',
                    fechaRegistro: '2023-08-10',
                    totalReservas: 15,
                    ultimaReserva: '2025-06-01'
                },
                {
                    id: 3,
                    nombre: 'Ana',
                    apellido: 'López',
                    rut: '15.987.654-3',
                    email: 'ana.lopez@gmail.com',
                    telefono: '+56 9 5555 0000',
                    direccion: 'Pasaje Los Rosales 789, Concepción',
                    fechaNacimiento: '1992-07-12',
                    tipoCliente: 'particular',
                    empresa: '',
                    observaciones: '',
                    fechaRegistro: '2025-02-20',
                    totalReservas: 2,
                    ultimaReserva: '2025-05-15'
                }
            ];
            setClientes(mockData);
        } catch (error) {
            console.error('Error cargando clientes:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedCliente) {
                console.log('Actualizando cliente:', formData);
            } else {
                console.log('Creando nuevo cliente:', formData);
            }
            closeModal();
            loadClientes();
        } catch (error) {
            console.error('Error al guardar cliente:', error);
        }
    };

    const openModal = (cliente = null) => {
        if (cliente) {
            setSelectedCliente(cliente);
            setFormData(cliente);
        } else {
            setSelectedCliente(null);
            setFormData({
                nombre: '',
                apellido: '',
                rut: '',
                email: '',
                telefono: '',
                direccion: '',
                fechaNacimiento: '',
                tipoCliente: 'particular',
                empresa: '',
                observaciones: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCliente(null);
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.rut.includes(searchTerm)
    );

    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-content">
                    <h1>
                        <span className="section-icon">👥</span>
                        Gestión de Clientes
                    </h1>
                    <p>Administra la información de tus clientes</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <span>➕</span>
                    Nuevo Cliente
                </button>
            </div>

            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <div>
                        <h3>{clientes.length}</h3>
                        <p>Total Clientes</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">👤</span>
                    <div>
                        <h3>{clientes.filter(c => c.tipoCliente === 'particular').length}</h3>
                        <p>Particulares</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🏢</span>
                    <div>
                        <h3>{clientes.filter(c => c.tipoCliente === 'empresa').length}</h3>
                        <p>Empresas</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div>
                        <h3>{clientes.reduce((sum, c) => sum + c.totalReservas, 0)}</h3>
                        <p>Total Reservas</p>
                    </div>
                </div>
            </div>

            <div className="section-content">
                <div className="content-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o RUT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                </div>

                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Contacto</th>
                                <th>Tipo</th>
                                <th>Reservas</th>
                                <th>Última Reserva</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClientes.map(cliente => (
                                <tr key={cliente.id}>
                                    <td>
                                        <div className="client-info">
                                            <div className="client-avatar">
                                                {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                                            </div>
                                            <div>
                                                <div><strong>{cliente.nombre} {cliente.apellido}</strong></div>
                                                <small>{cliente.rut}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            <div>📧 {cliente.email}</div>
                                            <div>📱 {cliente.telefono}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${cliente.tipoCliente === 'empresa' ? 'badge-info' : 'badge-success'}`}>
                                            {cliente.tipoCliente === 'empresa' ? '🏢 Empresa' : '👤 Particular'}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{cliente.totalReservas}</strong>
                                        <br />
                                        <small>reservas</small>
                                    </td>
                                    <td>
                                        {new Date(cliente.ultimaReserva).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-view">👁️</button>
                                            <button className="btn-edit" onClick={() => openModal(cliente)}>✏️</button>
                                            <button className="btn-delete">🗑️</button>
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
                            <h2>{selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Apellido</label>
                                        <input
                                            type="text"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>RUT</label>
                                        <input
                                            type="text"
                                            name="rut"
                                            value={formData.rut}
                                            onChange={handleInputChange}
                                            placeholder="12.345.678-9"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tipo de Cliente</label>
                                        <select
                                            name="tipoCliente"
                                            value={formData.tipoCliente}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="particular">Particular</option>
                                            <option value="empresa">Empresa</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono</label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            name="fechaNacimiento"
                                            value={formData.fechaNacimiento}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {formData.tipoCliente === 'empresa' && (
                                        <div className="form-group">
                                            <label>Empresa</label>
                                            <input
                                                type="text"
                                                name="empresa"
                                                value={formData.empresa}
                                                onChange={handleInputChange}
                                                placeholder="Nombre de la empresa"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Observaciones</label>
                                    <textarea
                                        name="observaciones"
                                        value={formData.observaciones}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Información adicional sobre el cliente..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {selectedCliente ? 'Actualizar' : 'Crear'} Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Clientes;