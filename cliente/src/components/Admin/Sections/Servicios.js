import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        loadServicios();
    }, []);

    const loadServicios = async () => {
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

            // Fallback a datos mock en caso de error
            const mockData = [
                {
                    id: 1,
                    nombre: 'Servicio de Catering Premium',
                    descripcion: 'Menú completo para 50 personas con entrada, plato principal y postre',
                    precio: 450000,
                    categoria: 'Catering',
                    disponible: true,
                    proveedorExterno: false,
                    tiempoPreparacion: '2 días',
                    observaciones: 'Incluye meseros y vajilla - Datos de prueba sin conexión a BD',
                    reservasActivas: 0
                }
            ];
            setServicios(mockData);
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
            const url = selectedServicio
                ? `${API_BASE_URL}/api/servicios/${selectedServicio.id}`
                : `${API_BASE_URL}/api/servicios`;

            const method = selectedServicio ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    precio: parseFloat(formData.precio)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar servicio');
            }

            const result = await response.json();
            console.log(selectedServicio ? 'Servicio actualizado:' : 'Servicio creado:', result);

            closeModal();
            await loadServicios(); // Recargar la lista

        } catch (error) {
            console.error('Error al guardar servicio:', error);
            setError(error.message || 'Error al guardar el servicio');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (servicio = null) => {
        if (servicio) {
            setSelectedServicio(servicio);
            setFormData({
                nombre: servicio.nombre,
                descripcion: servicio.descripcion,
                precio: servicio.precio,
                categoria: servicio.categoria,
                disponible: servicio.disponible,
                proveedorExterno: servicio.proveedorExterno,
                tiempoPreparacion: servicio.tiempoPreparacion,
                observaciones: servicio.observaciones
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

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este servicio?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/servicios/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar servicio');
            }

            console.log('Servicio eliminado:', id);
            await loadServicios();

        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            setError(error.message || 'Error al eliminar el servicio');
        } finally {
            setLoading(false);
        }
    };

    const toggleDisponibilidad = async (id) => {
        try {
            console.log('Cambiando disponibilidad del servicio:', id);
            alert('Esta funcionalidad requiere agregar campos adicionales a la tabla servicio en la BD');
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
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
                        <h3>{servicios.reduce((sum, s) => sum + s.reservasActivas, 0)}</h3>
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
                                        <span>Precio: ${servicio.precio.toLocaleString()}</span>
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
                                        <span>Reservas activas: {servicio.reservasActivas}</span>
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
                                >
                                    {servicio.disponible ? '🚫 Deshabilitar' : '✅ Habilitar'}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => handleDelete(servicio.id)}
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