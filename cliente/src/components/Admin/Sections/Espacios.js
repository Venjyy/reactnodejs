import React, { useState, useEffect } from 'react';
import './Sections.css';

function Espacios() {
    const [espacios, setEspacios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEspacio, setSelectedEspacio] = useState(null);
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

    useEffect(() => {
        loadEspacios();
    }, []);

    const loadEspacios = async () => {
        try {
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
                },
                {
                    id: 2,
                    nombre: 'Salón VIP',
                    descripcion: 'Exclusivo salón para eventos premium con servicios de lujo',
                    capacidadMaxima: 60,
                    costoBase: 550000,
                    ubicacion: 'Segundo Piso',
                    disponible: true,
                    equipamiento: 'Mobiliario premium, sistema audiovisual HD, barra, climatización',
                    caracteristicas: 'Vista panorámica, baño privado, zona de espera',
                    tipoEspacio: 'Salón VIP',
                    dimensiones: '12m x 15m',
                    observaciones: 'Incluye servicio de meseros',
                    reservasActuales: 5
                },
                {
                    id: 3,
                    nombre: 'Terraza Jardín',
                    descripcion: 'Hermosa terraza al aire libre con vista al jardín',
                    capacidadMaxima: 80,
                    costoBase: 280000,
                    ubicacion: 'Exterior',
                    disponible: false,
                    equipamiento: 'Pérgola, calefactores, iluminación exterior',
                    caracteristicas: 'Al aire libre, vista al jardín, techo retráctil',
                    tipoEspacio: 'Terraza',
                    dimensiones: '10m x 18m',
                    observaciones: 'No disponible en temporada de lluvias (hasta julio)',
                    reservasActuales: 3
                },
                {
                    id: 4,
                    nombre: 'Sala de Reuniones',
                    descripcion: 'Espacio íntimo para reuniones familiares pequeñas',
                    capacidadMaxima: 25,
                    costoBase: 150000,
                    ubicacion: 'Planta Principal',
                    disponible: true,
                    equipamiento: 'Mesa de conferencias, proyector, pizarra',
                    caracteristicas: 'Ambiente silencioso, wifi, climatización',
                    tipoEspacio: 'Sala de Reuniones',
                    dimensiones: '6m x 8m',
                    observaciones: 'Ideal para eventos corporativos',
                    reservasActuales: 2
                }
            ];
            setEspacios(mockData);
        } catch (error) {
            console.error('Error cargando espacios:', error);
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
            if (selectedEspacio) {
                console.log('Actualizando espacio:', formData);
            } else {
                console.log('Creando nuevo espacio:', formData);
            }
            closeModal();
            loadEspacios();
        } catch (error) {
            console.error('Error al guardar espacio:', error);
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
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEspacio(null);
    };

    const toggleDisponibilidad = async (id) => {
        try {
            console.log('Cambiando disponibilidad del espacio:', id);
            loadEspacios();
        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
        }
    };

    const filteredEspacios = espacios.filter(espacio =>
        espacio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        espacio.tipoEspacio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-content">
                    <h1>
                        <span className="section-icon">🏢</span>
                        Gestión de Espacios
                    </h1>
                    <p>Administra los espacios disponibles para eventos</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
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
                        <h3>{espacios.reduce((sum, e) => sum + e.reservasActuales, 0)}</h3>
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
                                        <span>Costo: ${espacio.costoBase.toLocaleString()}</span>
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
                                        <span>Reservas activas: {espacio.reservasActuales}</span>
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
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    className={`btn-toggle ${espacio.disponible ? 'btn-disable' : 'btn-enable'}`}
                                    onClick={() => toggleDisponibilidad(espacio.id)}
                                >
                                    {espacio.disponible ? '🚫 Deshabilitar' : '✅ Habilitar'}
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
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tipo de Espacio</label>
                                        <select
                                            name="tipoEspacio"
                                            value={formData.tipoEspacio}
                                            onChange={handleInputChange}
                                            required
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
                                            required
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
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="disponible"
                                            checked={formData.disponible}
                                            onChange={handleInputChange}
                                        />
                                        Espacio disponible para reservas
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {selectedEspacio ? 'Actualizar' : 'Crear'} Espacio
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