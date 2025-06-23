import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import './Sections.css';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        nombre: '',
        rut: '',
        correo: '',
        telefono: ''
    });

    // Configuración global de SweetAlert2 para bloquear scroll
    useEffect(() => {
        // Configurar SweetAlert2 para que bloquee el scroll cuando se abra
        const originalDidOpen = Swal.getDidOpen;
        const originalWillClose = Swal.getWillClose;

        Swal.mixin({
            didOpen: () => {
                document.body.style.overflow = 'hidden';
                if (originalDidOpen) originalDidOpen();
            },
            willClose: () => {
                document.body.style.overflow = 'unset';
                if (originalWillClose) originalWillClose();
            }
        });

        return () => {
            // Cleanup al desmontar
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Efecto para controlar el scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup: restaurar el scroll cuando el componente se desmonte
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    // Función helper para mostrar alertas con configuración consistente
    const showAlert = useCallback((config) => {
        // Bloquear scroll antes de mostrar la alerta
        document.body.style.overflow = 'hidden';

        return Swal.fire({
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                document.body.style.overflow = 'hidden';
            },
            willClose: () => {
                document.body.style.overflow = 'unset';
            },
            ...config
        });
    }, []);

    const loadClientes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/clientes');

            if (response.ok) {
                const data = await response.json();
                setClientes(data);
            } else {
                console.error('Error al cargar clientes:', response.status);
                await showAlert({
                    title: 'Error',
                    text: 'Error al cargar la lista de clientes',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            }
        } catch (error) {
            console.error('Error cargando clientes:', error);
            await showAlert({
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    useEffect(() => {
        loadClientes();
    }, [loadClientes]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = selectedCliente
                ? `http://localhost:3001/clientes/${selectedCliente.id}`
                : 'http://localhost:3001/clientes';

            const method = selectedCliente ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // Cerrar modal antes de mostrar cualquier alerta
            closeModal();

            if (response.ok) {
                await showAlert({
                    title: '¡Éxito!',
                    text: selectedCliente ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });
                loadClientes();
            } else {
                const error = await response.json();
                await showAlert({
                    title: 'Error',
                    text: error.error || 'No se pudo guardar el cliente',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            }
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            closeModal();
            await showAlert({
                title: 'Error de conexión',
                text: 'Error al guardar cliente. Verifique su conexión.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    const handleDelete = async (clienteId) => {
        const result = await showAlert({
            title: '¿Eliminar cliente?',
            text: '¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:3001/clientes/${clienteId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await showAlert({
                        title: '¡Eliminado!',
                        text: 'El cliente ha sido eliminado exitosamente',
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#28a745',
                        timer: 3000,
                        timerProgressBar: true
                    });
                    loadClientes();
                } else {
                    const error = await response.json();
                    await showAlert({
                        title: 'Error al eliminar',
                        text: error.error || 'No se pudo eliminar el cliente',
                        icon: 'error',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#dc3545'
                    });
                }
            } catch (error) {
                console.error('Error al eliminar cliente:', error);
                await showAlert({
                    title: 'Error de conexión',
                    text: 'Error al eliminar cliente. Verifique su conexión.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            }
        }
    };

    const openModal = (cliente = null) => {
        if (cliente) {
            setSelectedCliente(cliente);
            setFormData({
                nombre: cliente.nombre,
                rut: cliente.rut,
                correo: cliente.correo || '',
                telefono: cliente.telefono || ''
            });
        } else {
            setSelectedCliente(null);
            setFormData({
                nombre: '',
                rut: '',
                correo: '',
                telefono: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCliente(null);
        setFormData({
            nombre: '',
            rut: '',
            correo: '',
            telefono: ''
        });
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return 'Sin reservas';
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES');
    };

    const obtenerIniciales = (nombre) => {
        if (!nombre) return '??';
        const palabras = nombre.split(' ');
        if (palabras.length >= 2) {
            return `${palabras[0][0]}${palabras[1][0]}`.toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.correo && cliente.correo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        cliente.rut.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="section-container">
                <div className="loading-container">
                    <p>Cargando clientes...</p>
                </div>
            </div>
        );
    }

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
                    <span className="stat-icon">📧</span>
                    <div>
                        <h3>{clientes.filter(c => c.correo).length}</h3>
                        <p>Con Email</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📱</span>
                    <div>
                        <h3>{clientes.filter(c => c.telefono).length}</h3>
                        <p>Con Teléfono</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div>
                        <h3>{clientes.reduce((sum, c) => sum + (c.total_reservas || 0), 0)}</h3>
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
                                <th>Reservas</th>
                                <th>Última Reserva</th>
                                <th>Fecha Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClientes.length > 0 ? (
                                filteredClientes.map(cliente => (
                                    <tr key={cliente.id}>
                                        <td>
                                            <div className="client-info">
                                                <div className="client-avatar">
                                                    {obtenerIniciales(cliente.nombre)}
                                                </div>
                                                <div>
                                                    <div><strong>{cliente.nombre}</strong></div>
                                                    <small>{cliente.rut}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-info">
                                                <div>📧 {cliente.correo || 'Sin email'}</div>
                                                <div>📱 {cliente.telefono || 'Sin teléfono'}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <strong>{cliente.total_reservas || 0}</strong>
                                            <br />
                                            <small>reservas</small>
                                        </td>
                                        <td>
                                            {formatearFecha(cliente.ultima_reserva)}
                                        </td>
                                        <td>
                                            {formatearFecha(cliente.fecha_creacion)}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => openModal(cliente)}
                                                    title="Editar cliente"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(cliente.id)}
                                                    title="Eliminar cliente"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                        No se encontraron clientes
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div
                    className="modal-overlay"
                    onClick={(e) => {
                        // Solo cerrar si se hace click en el overlay, no en el contenido del modal
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div className="modal modal-large">
                        <div className="modal-header">
                            <h2>{selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre Completo</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="Ingrese el nombre completo"
                                        />
                                    </div>
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
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleInputChange}
                                            placeholder="ejemplo@correo.com"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono</label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            placeholder="+56 9 1234 5678"
                                        />
                                    </div>
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