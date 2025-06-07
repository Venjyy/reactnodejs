import React, { useState, useEffect } from 'react';
import './Sections.css';

function Espacios() {
    const [espacios, setEspacios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEspacio, setSelectedEspacio] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        capacidadMaxima: '',
        costoBase: '',
        ubicacion: '',
        disponible: true,
        equipamiento: '',
        caracteristicas: '',
        tipoEspacio: '',
        dimensiones: '',
        observaciones: ''
    });

    const tiposEspacio = [
        'Salón Principal',
        'Salón VIP',
        'Terraza',
        'Jardín',
        'Sala de Reuniones',
        'Auditorio',
        'Patio',
        'Otro'
    ];

    const API_BASE_URL = 'http://localhost:3001';

    useEffect(() => {
        loadEspacios();
    }, []);

    const loadEspacios = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/espacios`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setEspacios(data);
            console.log('Espacios cargados desde la BD:', data);
        } catch (error) {
            console.error('Error cargando espacios:', error);
            setError('Error al cargar los espacios. Verifique la conexión con el servidor.');

            // Fallback a datos mock en caso de error
            const mockData = [
                {
                    id: 1,
                    nombre: 'Salón Principal',
                    descripcion: 'Amplio salón ideal para celebraciones familiares y eventos sociales',
                    capacidadMaxima: 120,
                    costoBase: 380000,
                    ubicacion: 'Planta Principal',
                    disponible: true,
                    equipamiento: 'Mesas, sillas, sistema de sonido básico, iluminación LED',
                    caracteristicas: 'Aire acondicionado, acceso para discapacitados, cocina auxiliar',
                    tipoEspacio: 'Salón Principal',
                    dimensiones: '15m x 20m',
                    observaciones: 'Espacio más solicitado, reservar con anticipación',
                    reservasActuales: 8
                }
            ];
            setEspacios(mockData);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = selectedEspacio
                ? `${API_BASE_URL}/api/espacios/${selectedEspacio.id}`
                : `${API_BASE_URL}/api/espacios`;

            const method = selectedEspacio ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    capacidadMaxima: parseInt(formData.capacidadMaxima),
                    costoBase: parseFloat(formData.costoBase)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar espacio');
            }

            const result = await response.json();
            console.log(selectedEspacio ? 'Espacio actualizado:' : 'Espacio creado:', result);

            closeModal();
            await loadEspacios(); // Recargar la lista

        } catch (error) {
            console.error('Error al guardar espacio:', error);
            setError(error.message || 'Error al guardar el espacio');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (espacio = null) => {
        if (espacio) {
            setSelectedEspacio(espacio);
            setFormData(espacio);
        } else {
            setSelectedEspacio(null);
            setFormData({
                nombre: '',
                descripcion: '',
                capacidadMaxima: '',
                costoBase: '',
                ubicacion: '',
                disponible: true,
                equipamiento: '',
                caracteristicas: '',
                tipoEspacio: '',
                dimensiones: '',
                observaciones: ''
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEspacio(null);
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este espacio?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/espacios/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar espacio');
            }

            console.log('Espacio eliminado:', id);
            await loadEspacios(); // Recargar la lista

        } catch (error) {
            console.error('Error al eliminar espacio:', error);
            setError(error.message || 'Error al eliminar el espacio');
        } finally {
            setLoading(false);
        }
    };

    const toggleDisponibilidad = async (id) => {
        const espacio = espacios.find(e => e.id === id);
        if (!espacio) return;

        const nuevaDisponibilidad = !espacio.disponible;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/espacios/${id}/disponibilidad`, {
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

            console.log('Disponibilidad cambiada para espacio:', id);
            await loadEspacios(); // Recargar la lista

        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            setError(error.message || 'Error al cambiar la disponibilidad');
        } finally {
            setLoading(false);
        }
    };

    const filteredEspacios = espacios.filter(espacio =>
        espacio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        espacio.tipoEspacio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && espacios.length === 0) {
        return (
            <div className="section-container">
                <div className="loading-message">
                    <h2>Cargando espacios...</h2>
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
                        <span className="section-icon">🏢</span>
                        Gestión de Espacios
                    </h1>
                    <p>Administra los espacios disponibles para eventos</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => openModal()}
                    disabled={loading}
                >
                    <span>➕</span>
                    Nuevo Espacio
                </button>
            </div>

            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">🏢</span>
                    <div>
                        <h3>{espacios.length}</h3>
                        <p>Total Espacios</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">✅</span>
                    <div>
                        <h3>{espacios.filter(e => e.disponible).length}</h3>
                        <p>Disponibles</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <div>
                        <h3>{espacios.reduce((sum, e) => sum + e.capacidadMaxima, 0)}</h3>
                        <p>Capacidad Total</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>{espacios.reduce((sum, e) => sum + (e.reservasActuales || 0), 0)}</h3>
                        <p>Reservas Activas</p>
                    </div>
                </div>
            </div>

            <div className="section-content">
                <div className="content-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar espacio por nombre o tipo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                </div>

                <div className="spaces-grid">
                    {filteredEspacios.map(espacio => (
                        <div key={espacio.id} className={`space-card ${!espacio.disponible ? 'unavailable' : ''}`}>
                            <div className="space-header">
                                <h3>{espacio.nombre}</h3>
                                <span className={`status-badge ${espacio.disponible ? 'available' : 'unavailable'}`}>
                                    {espacio.disponible ? '✅ Disponible' : '❌ No Disponible'}
                                </span>
                            </div>

                            <div className="space-info">
                                <p className="description">{espacio.descripcion}</p>

                                <div className="space-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">👥</span>
                                        <span>Capacidad: {espacio.capacidadMaxima} personas</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">💰</span>
                                        <span>Costo: ${Number(espacio.costoBase).toLocaleString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📍</span>
                                        <span>Ubicación: {espacio.ubicacion}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📏</span>
                                        <span>Dimensiones: {espacio.dimensiones}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📅</span>
                                        <span>Reservas activas: {espacio.reservasActuales || 0}</span>
                                    </div>
                                </div>

                                <div className="space-equipment">
                                    <strong>Equipamiento:</strong>
                                    <p>{espacio.equipamiento}</p>
                                </div>

                                {espacio.observaciones && (
                                    <div className="space-equipment">
                                        <strong>Observaciones:</strong>
                                        <p>{espacio.observaciones}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-actions">
                                <button
                                    className="btn-edit"
                                    onClick={() => openModal(espacio)}
                                    disabled={loading}
                                >
                                    ✏️ Editar
                                </button>
                                {/* AGREGAR ESTE BOTÓN AQUÍ: */}
                                <button
                                    className={`btn-toggle ${espacio.disponible ? 'btn-disable' : 'btn-enable'}`}
                                    onClick={() => toggleDisponibilidad(espacio.id)}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: espacio.disponible ? '#dc3545' : '#28a745',
                                        color: 'white',
                                        marginLeft: '10px',
                                        padding: '5px 10px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {espacio.disponible ? '🚫 Deshabilitar' : '✅ Habilitar'}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => handleDelete(espacio.id)}
                                    disabled={loading}
                                    style={{ backgroundColor: '#dc3545', color: 'white' }}
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredEspacios.length === 0 && !loading && (
                    <div className="empty-state">
                        <h3>No se encontraron espacios</h3>
                        <p>
                            {searchTerm
                                ? 'No hay espacios que coincidan con la búsqueda.'
                                : 'No hay espacios registrados en la base de datos.'}
                        </p>
                        {!searchTerm && (
                            <button className="btn-primary" onClick={() => openModal()}>
                                Crear primer espacio
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
                            <h2>{selectedEspacio ? 'Editar Espacio' : 'Nuevo Espacio'}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nombre del Espacio</label>
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
                                        <label>Tipo de Espacio</label>
                                        <select
                                            name="tipoEspacio"
                                            value={formData.tipoEspacio}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        >
                                            <option value="">Seleccionar tipo</option>
                                            {tiposEspacio.map(tipo => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        required
                                        rows="3"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Capacidad Máxima</label>
                                        <input
                                            type="number"
                                            name="capacidadMaxima"
                                            value={formData.capacidadMaxima}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Costo Base ($)</label>
                                        <input
                                            type="number"
                                            name="costoBase"
                                            value={formData.costoBase}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Ubicación</label>
                                        <input
                                            type="text"
                                            name="ubicacion"
                                            value={formData.ubicacion}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Dimensiones</label>
                                        <input
                                            type="text"
                                            name="dimensiones"
                                            value={formData.dimensiones}
                                            onChange={handleInputChange}
                                            placeholder="Ej: 10m x 15m"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Equipamiento</label>
                                    <textarea
                                        name="equipamiento"
                                        value={formData.equipamiento}
                                        onChange={handleInputChange}
                                        rows="2"
                                        placeholder="Describe el equipamiento disponible..."
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Características</label>
                                    <textarea
                                        name="caracteristicas"
                                        value={formData.caracteristicas}
                                        onChange={handleInputChange}
                                        rows="2"
                                        placeholder="Características especiales del espacio..."
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
                                        placeholder="Información adicional..."
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="disponible"
                                            checked={formData.disponible}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        Espacio disponible para reservas
                                    </label>
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
                                    {loading ? 'Guardando...' : (selectedEspacio ? 'Actualizar' : 'Crear')} Espacio
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Espacios;