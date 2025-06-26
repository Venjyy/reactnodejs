import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import './Sections.css';

function Servicios() {
    const [servicios, setServicios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        disponible: true,
        proveedorExterno: false,
        tiempoPreparacion: '',
        observaciones: ''
    });

    const API_BASE_URL = 'http://localhost:3001';

    const categorias = [
        'Catering',
        'Decoración',
        'Sonido y Música',
        'Fotografía',
        'Animación',
        'Mobiliario',
        'Iluminación',
        'Otros'
    ];

    // Efecto para controlar el scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    // Función helper para mostrar alertas con configuración consistente
    const showAlert = useCallback((config) => {
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

    const loadServicios = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/servicios`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setServicios(data);
            console.log('Servicios cargados desde la BD:', data);
        } catch (error) {
            console.error('Error cargando servicios:', error);
            setError('Error al cargar los servicios. Verifique la conexión con el servidor.');
            setServicios([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadServicios();
    }, [loadServicios]);

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    // Función para comparar cambios en edición
    const getChanges = (original, updated) => {
        const changes = [];
        const fieldsToCompare = {
            nombre: 'Nombre',
            descripcion: 'Descripción',
            precio: 'Precio',
            categoria: 'Categoría',
            disponible: 'Disponibilidad',
            proveedorExterno: 'Proveedor Externo',
            tiempoPreparacion: 'Tiempo de Preparación',
            observaciones: 'Observaciones'
        };

        Object.keys(fieldsToCompare).forEach(field => {
            const originalValue = original[field];
            const updatedValue = updated[field];

            if (originalValue !== updatedValue) {
                if (field === 'disponible') {
                    changes.push(`${fieldsToCompare[field]}: ${originalValue ? 'Disponible' : 'No disponible'} → ${updatedValue ? 'Disponible' : 'No disponible'}`);
                } else if (field === 'proveedorExterno') {
                    changes.push(`${fieldsToCompare[field]}: ${originalValue ? 'Sí' : 'No'} → ${updatedValue ? 'Sí' : 'No'}`);
                } else if (field === 'precio') {
                    changes.push(`${fieldsToCompare[field]}: $${Number(originalValue).toLocaleString()} → $${Number(updatedValue).toLocaleString()}`);
                } else {
                    changes.push(`${fieldsToCompare[field]}: "${originalValue || 'Sin definir'}" → "${updatedValue || 'Sin definir'}"`);
                }
            }
        });

        return changes;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = selectedServicio
                ? `${API_BASE_URL}/api/servicios/${selectedServicio.id}`
                : `${API_BASE_URL}/api/servicios`;

            const method = selectedServicio ? 'PUT' : 'POST';

            const dataToSend = {
                nombre: formData.nombre,
                precio: parseFloat(formData.precio),
                descripcion: formData.descripcion,
                categoria: formData.categoria,
                disponible: formData.disponible,
                proveedorExterno: formData.proveedorExterno,
                tiempoPreparacion: formData.tiempoPreparacion,
                observaciones: formData.observaciones
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar servicio');
            }

            closeModal();

            if (selectedServicio) {
                // Es una edición - mostrar cambios realizados
                const changes = getChanges(selectedServicio, dataToSend);

                if (changes.length > 0) {
                    await showAlert({
                        title: '¡Servicio Actualizado!',
                        html: `
                            <div style="text-align: left;">
                                <p><strong>Los siguientes cambios han sido guardados:</strong></p>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    ${changes.map(change => `<li>${change}</li>`).join('')}
                                </ul>
                            </div>
                        `,
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#28a745',
                        timer: 5000,
                        timerProgressBar: true
                    });
                } else {
                    await showAlert({
                        title: 'Sin cambios',
                        text: 'No se detectaron cambios en el servicio',
                        icon: 'info',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#17a2b8',
                        timer: 3000,
                        timerProgressBar: true
                    });
                }
            } else {
                // Es una creación
                await showAlert({
                    title: '¡Servicio Creado!',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>Nuevo servicio "${formData.nombre}" creado exitosamente:</strong></p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Precio: $${Number(formData.precio).toLocaleString()}</li>
                                <li>Categoría: ${formData.categoria || 'No especificada'}</li>
                                <li>Tipo: ${formData.proveedorExterno ? 'Proveedor Externo' : 'Servicio Propio'}</li>
                                <li>Estado: ${formData.disponible ? 'Disponible' : 'No disponible'}</li>
                                <li>Preparación: ${formData.tiempoPreparacion || 'No especificado'}</li>
                            </ul>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    timer: 4000,
                    timerProgressBar: true
                });
            }

            await loadServicios();

        } catch (error) {
            console.error('Error al guardar servicio:', error);
            closeModal();
            await showAlert({
                title: 'Error al guardar',
                text: error.message || 'No se pudo guardar el servicio. Verifique su conexión.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setLoading(false);
        }
    };

    const openModal = (servicio = null) => {
        if (servicio) {
            setSelectedServicio(servicio);
            setFormData({
                nombre: servicio.nombre || '',
                descripcion: servicio.descripcion || '',
                precio: servicio.precio || '',
                categoria: servicio.categoria || '',
                disponible: servicio.disponible !== undefined ? servicio.disponible : true,
                proveedorExterno: servicio.proveedorExterno !== undefined ? servicio.proveedorExterno : false,
                tiempoPreparacion: servicio.tiempoPreparacion || '',
                observaciones: servicio.observaciones || ''
            });
        } else {
            setSelectedServicio(null);
            setFormData({
                nombre: '',
                descripcion: '',
                precio: '',
                categoria: 'Otros',
                disponible: true,
                proveedorExterno: false,
                tiempoPreparacion: '1 día',
                observaciones: ''
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedServicio(null);
        setError('');
    };

    const handleDelete = async (servicio) => {
        const result = await showAlert({
            title: '¿Eliminar servicio?',
            html: `
                <div style="text-align: left;">
                    <p>¿Estás seguro de que deseas eliminar el servicio <strong>"${servicio.nombre}"</strong>?</p>
                    <div style="margin: 15px 0; padding: 10px; background-color: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
                        <strong>⚠️ Esta acción no se puede deshacer</strong>
                        <ul style="margin: 8px 0; padding-left: 20px;">
                            <li>Se eliminará permanentemente el servicio</li>
                            <li>Se perderán todas las configuraciones</li>
                            ${servicio.reservasActivas > 0 ? `<li style="color: #dc3545;"><strong>Atención:</strong> Este servicio tiene ${servicio.reservasActivas} reserva(s) activa(s)</li>` : ''}
                        </ul>
                    </div>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/servicios/${servicio.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al eliminar servicio');
                }

                await showAlert({
                    title: '¡Servicio Eliminado!',
                    html: `
                        <div style="text-align: center;">
                            <p>El servicio <strong>"${servicio.nombre}"</strong> ha sido eliminado exitosamente.</p>
                            <div style="margin-top: 15px; padding: 10px; background-color: #d4edda; border-radius: 4px;">
                                <small>✅ Todos los datos asociados han sido removidos del sistema</small>
                            </div>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });

                await loadServicios();

            } catch (error) {
                console.error('Error al eliminar servicio:', error);
                await showAlert({
                    title: 'Error al eliminar',
                    text: error.message || 'No se pudo eliminar el servicio. Verifique su conexión.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleDisponibilidad = async (id) => {
        const servicio = servicios.find(s => s.id === id);
        if (!servicio) return;

        const nuevaDisponibilidad = !servicio.disponible;
        const accion = nuevaDisponibilidad ? 'habilitar' : 'deshabilitar';

        const result = await showAlert({
            title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} servicio?`,
            html: `
                <div style="text-align: left;">
                    <p>¿Deseas <strong>${accion}</strong> el servicio <strong>"${servicio.nombre}"</strong>?</p>
                    <div style="margin: 15px 0; padding: 10px; background-color: ${nuevaDisponibilidad ? '#d4edda' : '#f8d7da'}; border-radius: 4px;">
                        <p style="margin: 0;"><strong>${nuevaDisponibilidad ? '✅' : '❌'} El servicio quedará ${nuevaDisponibilidad ? 'disponible' : 'no disponible'} para nuevas reservas</strong></p>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: nuevaDisponibilidad ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/servicios/${id}/disponibilidad`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ disponible: nuevaDisponibilidad })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al cambiar disponibilidad');
                }

                await showAlert({
                    title: '¡Disponibilidad Actualizada!',
                    text: `El servicio "${servicio.nombre}" ahora está ${nuevaDisponibilidad ? 'disponible' : 'no disponible'} para reservas`,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });

                await loadServicios();

            } catch (error) {
                console.error('Error al cambiar disponibilidad:', error);
                await showAlert({
                    title: 'Error al cambiar disponibilidad',
                    text: error.message || 'No se pudo cambiar la disponibilidad. Verifique su conexión.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const filteredServicios = servicios.filter(servicio =>
        servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servicio.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && servicios.length === 0) {
        return (
            <div className="section-container">
                <div className="loading-message">
                    <h2>Cargando servicios...</h2>
                    <p>Conectando con la base de datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="section-container">
            {error && (
                <div className="error-message" style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    border: '1px solid #ffcdd2'
                }}>
                    {error}
                </div>
            )}

            <div className="section-header">
                <div className="header-content">
                    <h1>
                        <span className="section-icon">🎯</span>
                        Servicios Adicionales
                    </h1>
                    <p>Gestiona los servicios complementarios para eventos</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => openModal()}
                    disabled={loading}
                >
                    <span>➕</span>
                    Nuevo Servicio
                </button>
            </div>

            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">🎯</span>
                    <div>
                        <h3>{servicios.length}</h3>
                        <p>Total Servicios</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">✅</span>
                    <div>
                        <h3>{servicios.filter(s => s.disponible).length}</h3>
                        <p>Disponibles</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🏢</span>
                    <div>
                        <h3>{servicios.filter(s => !s.proveedorExterno).length}</h3>
                        <p>Servicios Propios</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div>
                        <h3>{servicios.reduce((sum, s) => sum + (s.reservasActivas || 0), 0)}</h3>
                        <p>Reservas Activas</p>
                    </div>
                </div>
            </div>

            <div className="section-content">
                <div className="content-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar servicio por nombre o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                </div>

                <div className="services-grid">
                    {filteredServicios.map(servicio => (
                        <div key={servicio.id} className={`service-card ${!servicio.disponible ? 'unavailable' : ''}`}>
                            <div className="service-header">
                                <h3>{servicio.nombre}</h3>
                                <span className={`status-badge ${servicio.disponible ? 'available' : 'unavailable'}`}>
                                    {servicio.disponible ? '✅ Disponible' : '❌ No Disponible'}
                                </span>
                            </div>

                            <div className="service-info">
                                <p className="description">{servicio.descripcion}</p>

                                <div className="service-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">💰</span>
                                        <span>Precio: ${Number(servicio.precio).toLocaleString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📂</span>
                                        <span>Categoría: {servicio.categoria}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">⏱️</span>
                                        <span>Preparación: {servicio.tiempoPreparacion}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">🏢</span>
                                        <span>{servicio.proveedorExterno ? 'Proveedor Externo' : 'Servicio Propio'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📅</span>
                                        <span>Reservas activas: {servicio.reservasActivas || 0}</span>
                                    </div>
                                </div>

                                {servicio.observaciones && (
                                    <div className="space-equipment">
                                        <strong>Observaciones:</strong>
                                        <p>{servicio.observaciones}</p>
                                    </div>
                                )}
                            </div>

                            <div className="service-actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => openModal(servicio)}
                                    disabled={loading}
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    className={`btn-toggle ${servicio.disponible ? 'btn-disable' : 'btn-enable'}`}
                                    onClick={() => toggleDisponibilidad(servicio.id)}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: servicio.disponible ? '#dc3545' : '#28a745',
                                        color: 'white',
                                        marginLeft: '10px',
                                        padding: '5px 10px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {servicio.disponible ? '🚫 Deshabilitar' : '✅ Habilitar'}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => handleDelete(servicio)}
                                    disabled={loading}
                                    style={{ backgroundColor: '#dc3545', color: 'white' }}
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredServicios.length === 0 && !loading && (
                    <div className="empty-state">
                        <h3>No se encontraron servicios</h3>
                        <p>
                            {searchTerm
                                ? 'No hay servicios que coincidan con la búsqueda.'
                                : 'No hay servicios registrados en la base de datos.'}
                        </p>
                        {!searchTerm && (
                            <button className="btn-primary" onClick={() => openModal()}>
                                Crear primer servicio
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal modal-large">
                        <div className="modal-header">
                            <h2>{selectedServicio ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre del Servicio</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Precio ($)</label>
                                        <input
                                            type="number"
                                            name="precio"
                                            value={formData.precio}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Categoría</label>
                                        <select
                                            name="categoria"
                                            value={formData.categoria}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        >
                                            {categorias.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Tiempo de Preparación</label>
                                        <input
                                            type="text"
                                            name="tiempoPreparacion"
                                            value={formData.tiempoPreparacion}
                                            onChange={handleInputChange}
                                            placeholder="Ej: 2 días, 1 semana"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        rows="3"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Observaciones</label>
                                    <textarea
                                        name="observaciones"
                                        value={formData.observaciones}
                                        onChange={handleInputChange}
                                        rows="2"
                                        placeholder="Información adicional sobre el servicio..."
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="disponible"
                                                checked={formData.disponible}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                            />
                                            Servicio disponible
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="proveedorExterno"
                                                checked={formData.proveedorExterno}
                                                onChange={handleInputChange}
                                                disabled={loading}
                                            />
                                            Proveedor externo
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={closeModal}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : (selectedServicio ? 'Actualizar' : 'Crear')} Servicio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Servicios;