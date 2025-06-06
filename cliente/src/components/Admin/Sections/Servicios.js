import React, { useState, useEffect } from 'react';
import './Sections.css';

function Servicios() {
    const [servicios, setServicios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedServicio, setSelectedServicio] = useState(null);
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
        try {
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
                    observaciones: 'Incluye meseros y vajilla',
                    reservasActivas: 12
                },
                {
                    id: 2,
                    nombre: 'Decoración Temática Infantil',
                    descripcion: 'Decoración completa para fiestas infantiles con globos y figuras',
                    precio: 180000,
                    categoria: 'Decoración',
                    disponible: true,
                    proveedorExterno: true,
                    tiempoPreparacion: '1 día',
                    observaciones: 'Requiere confirmación con 3 días de anticipación',
                    reservasActivas: 8
                },
                {
                    id: 3,
                    nombre: 'Sistema de Sonido Profesional',
                    descripcion: 'Equipo de sonido completo con micrófonos y DJ',
                    precio: 250000,
                    categoria: 'Sonido y Música',
                    disponible: false,
                    proveedorExterno: false,
                    tiempoPreparacion: '0 días',
                    observaciones: 'En mantenimiento hasta el 20/06',
                    reservasActivas: 5
                },
                {
                    id: 4,
                    nombre: 'Fotografía Profesional',
                    descripcion: 'Sesión fotográfica de 4 horas con entrega digital',
                    precio: 320000,
                    categoria: 'Fotografía',
                    disponible: true,
                    proveedorExterno: true,
                    tiempoPreparacion: '0 días',
                    observaciones: 'Incluye edición básica',
                    reservasActivas: 15
                }
            ];
            setServicios(mockData);
        } catch (error) {
            console.error('Error cargando servicios:', error);
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
        try {
            if (selectedServicio) {
                console.log('Actualizando servicio:', formData);
            } else {
                console.log('Creando nuevo servicio:', formData);
            }
            closeModal();
            loadServicios();
        } catch (error) {
            console.error('Error al guardar servicio:', error);
        }
    };

    const openModal = (servicio = null) => {
        if (servicio) {
            setSelectedServicio(servicio);
            setFormData(servicio);
        } else {
            setSelectedServicio(null);
            setFormData({
                nombre: '',
                descripcion: '',
                precio: '',
                categoria: '',
                disponible: true,
                proveedorExterno: false,
                tiempoPreparacion: '',
                observaciones: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedServicio(null);
    };

    const toggleDisponibilidad = async (id) => {
        try {
            console.log('Cambiando disponibilidad del servicio:', id);
            loadServicios();
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
        }
    };

    const filteredServicios = servicios.filter(servicio =>
        servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servicio.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-content">
                    <h1>
                        <span className="section-icon">🎯</span>
                        Servicios Adicionales
                    </h1>
                    <p>Gestiona los servicios complementarios para eventos</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
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
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    className={`btn-toggle ${servicio.disponible ? 'btn-disable' : 'btn-enable'}`}
                                    onClick={() => toggleDisponibilidad(servicio.id)}
                                >
                                    {servicio.disponible ? '🚫 Deshabilitar' : '✅ Habilitar'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
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
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Categoría</label>
                                        <select
                                            name="categoria"
                                            value={formData.categoria}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Seleccionar categoría</option>
                                            {categorias.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
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
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Precio ($)</label>
                                        <input
                                            type="number"
                                            name="precio"
                                            value={formData.precio}
                                            onChange={handleInputChange}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tiempo de Preparación</label>
                                        <input
                                            type="text"
                                            name="tiempoPreparacion"
                                            value={formData.tiempoPreparacion}
                                            onChange={handleInputChange}
                                            placeholder="Ej: 2 días, 1 semana"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Observaciones</label>
                                    <textarea
                                        name="observaciones"
                                        value={formData.observaciones}
                                        onChange={handleInputChange}
                                        rows="2"
                                        placeholder="Información adicional sobre el servicio..."
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
                                            />
                                            Proveedor externo
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {selectedServicio ? 'Actualizar' : 'Crear'} Servicio
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