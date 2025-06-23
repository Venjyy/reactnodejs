import React, { useState, useEffect } from 'react';
import './Sections.css';

function Pagos() {
    const [pagos, setPagos] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPago, setSelectedPago] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalIngresos: 0,
        totalTransacciones: 0,
        pagosHoy: 0,
        pagosPendientes: 0
    });
    const [formData, setFormData] = useState({
        reservaId: '',
        monto: '',
        metodoPago: '',
        fechaPago: '',
        tipoPago: 'abono',
        comprobante: '',
        observaciones: ''
    });

    const API_BASE_URL = 'http://localhost:3001';

    const metodosPago = [
        'Efectivo',
        'Transferencia Bancaria',
        'Tarjeta de Crédito',
        'Tarjeta de Débito',
        'Cheque',
        'PayPal',
        'Otro'
    ];

    const tiposPago = [
        { value: 'anticipo', label: 'Anticipo' },
        { value: 'abono', label: 'Abono' },
        { value: 'pago_total', label: 'Pago Total' },
        { value: 'saldo_final', label: 'Saldo Final' }
    ];

    const estadosPago = [
        { value: 'pendiente', label: 'Pendiente', color: 'warning' },
        { value: 'confirmado', label: 'Confirmado', color: 'success' },
        { value: 'rechazado', label: 'Rechazado', color: 'danger' }
    ];

    useEffect(() => {
        loadPagos();
        loadReservas();
        loadEstadisticas();
    }, []);

    const loadPagos = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Intentando cargar pagos desde:', `${API_BASE_URL}/api/pagos`);
            const response = await fetch(`${API_BASE_URL}/api/pagos`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setPagos(data);
            console.log('Pagos cargados exitosamente:', data);
            setError(''); // Limpiar error si la carga fue exitosa
        } catch (error) {
            console.error('Error cargando pagos:', error);
            setError('No se pudieron cargar los pagos. Verificando conexión...');

            // No usar datos mock, dejar vacío
            setPagos([]);
        } finally {
            setLoading(false);
        }
    };

    const loadReservas = async () => {
        try {
            console.log('Intentando cargar reservas desde:', `${API_BASE_URL}/api/reservas-para-pagos`);
            const response = await fetch(`${API_BASE_URL}/api/reservas-para-pagos`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setReservas(data);
            console.log('Reservas cargadas exitosamente:', data);
        } catch (error) {
            console.error('Error cargando reservas:', error);
            setReservas([]);
        }
    };

    const loadEstadisticas = async () => {
        try {
            console.log('Intentando cargar estadísticas desde:', `${API_BASE_URL}/api/pagos/estadisticas`);
            const response = await fetch(`${API_BASE_URL}/api/pagos/estadisticas`);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setStats(data);
            console.log('Estadísticas cargadas exitosamente:', data);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            setStats({
                totalIngresos: 0,
                totalTransacciones: 0,
                pagosHoy: 0,
                pagosPendientes: 0
            });
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
            const url = selectedPago
                ? `${API_BASE_URL}/api/pagos/${selectedPago.id}`
                : `${API_BASE_URL}/api/pagos`;

            const method = selectedPago ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reservaId: formData.reservaId,
                    monto: parseFloat(formData.monto),
                    metodoPago: formData.metodoPago,
                    fechaPago: formData.fechaPago,
                    observaciones: formData.observaciones
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar pago');
            }

            const result = await response.json();
            console.log(selectedPago ? 'Pago actualizado:' : 'Pago creado:', result);

            closeModal();
            await loadPagos();
            await loadReservas();
            await loadEstadisticas();

        } catch (error) {
            console.error('Error al guardar pago:', error);
            setError(error.message || 'Error al guardar el pago');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (pago = null) => {
        if (pago) {
            setSelectedPago(pago);
            setFormData({
                reservaId: pago.reservaId,
                monto: pago.monto,
                metodoPago: pago.metodoPago,
                fechaPago: pago.fechaPago.split('T')[0], // Formatear fecha
                tipoPago: pago.tipoPago,
                comprobante: pago.comprobante,
                observaciones: pago.observaciones
            });
        } else {
            setSelectedPago(null);
            setFormData({
                reservaId: '',
                monto: '',
                metodoPago: 'Efectivo',
                fechaPago: new Date().toISOString().split('T')[0],
                tipoPago: 'abono',
                comprobante: '',
                observaciones: ''
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPago(null);
        setError('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Está seguro de que desea eliminar este pago?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/pagos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al eliminar pago');
            }

            console.log('Pago eliminado:', id);
            await loadPagos();
            await loadReservas();
            await loadEstadisticas();

        } catch (error) {
            console.error('Error al eliminar pago:', error);
            setError(error.message || 'Error al eliminar el pago');
        } finally {
            setLoading(false);
        }
    };

    const filteredPagos = pagos.filter(pago => {
        const matchesSearch = pago.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pago.espacioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pago.comprobante && pago.comprobante.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = filterStatus === 'todos' || pago.estado === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading && pagos.length === 0) {
        return (
            <div className="section-container">
                <div className="loading-message">
                    <h2>Cargando pagos...</h2>
                    <p>Conectando con la base de datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="section-container">
            {error && (
                <div className="error-message" style={{
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    border: '1px solid #ffeaa7'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <div className="section-header">
                <div className="header-content">
                    <h1>
                        <span className="section-icon">💰</span>
                        Control de Pagos
                    </h1>
                    <p>Gestiona los pagos y abonos de las reservas</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => openModal()}
                    disabled={loading}
                >
                    <span>➕</span>
                    Registrar Pago
                </button>
            </div>

            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <div>
                        <h3>${(stats.totalIngresos || 0).toLocaleString()}</h3>
                        <p>Ingresos Confirmados</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">⏳</span>
                    <div>
                        <h3>${(stats.pagosPendientes || 0).toLocaleString()}</h3>
                        <p>Pagos Pendientes</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>${(stats.pagosHoy || 0).toLocaleString()}</h3>
                        <p>Cobros Hoy</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div>
                        <h3>{stats.totalTransacciones || 0}</h3>
                        <p>Total Transacciones</p>
                    </div>
                </div>
            </div>

            <div className="section-content">
                <div className="content-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, espacio o comprobante..."
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
                        <option value="todos">Todos los estados</option>
                        {estadosPago.map(estado => (
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
                                <th>Cliente & Reserva</th>
                                <th>Monto</th>
                                <th>Método de Pago</th>
                                <th>Fecha</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Saldo Pendiente</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPagos.map(pago => (
                                <tr key={pago.id}>
                                    <td>
                                        <div>
                                            <strong>{pago.clienteNombre}</strong>
                                            <br />
                                            <small>{pago.espacioNombre}</small>
                                            <br />
                                            <small>Evento: {new Date(pago.fechaEvento).toLocaleDateString()}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>${pago.monto.toLocaleString()}</strong>
                                        <br />
                                        <small>Total: ${pago.costoTotal.toLocaleString()}</small>
                                    </td>
                                    <td>
                                        <div>
                                            {pago.metodoPago}
                                            <br />
                                            {pago.comprobante && (
                                                <small>#{pago.comprobante}</small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(pago.fechaPago).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className="badge badge-info">
                                            {tiposPago.find(t => t.value === pago.tipoPago)?.label || 'Abono'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${estadosPago.find(e => e.value === pago.estado)?.color || 'success'}`}>
                                            {estadosPago.find(e => e.value === pago.estado)?.label || 'Confirmado'}
                                        </span>
                                    </td>
                                    <td>
                                        <strong className={pago.saldoPendiente > 0 ? 'text-danger' : 'text-success'}>
                                            ${pago.saldoPendiente.toLocaleString()}
                                        </strong>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => openModal(pago)}
                                                disabled={loading}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-secondary"
                                                onClick={() => handleDelete(pago.id)}
                                                disabled={loading}
                                                style={{ backgroundColor: '#dc3545', color: 'white' }}
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

                {filteredPagos.length === 0 && !loading && (
                    <div className="empty-state">
                        <h3>No se encontraron pagos</h3>
                        <p>
                            {error
                                ? 'Hay un problema de conexión con el servidor.'
                                : searchTerm
                                    ? 'No hay pagos que coincidan con la búsqueda.'
                                    : 'No hay pagos registrados en la base de datos.'}
                        </p>
                        {!searchTerm && !error && (
                            <button className="btn-primary" onClick={() => openModal()}>
                                Registrar primer pago
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
                            <h2>{selectedPago ? 'Editar Pago' : 'Registrar Nuevo Pago'}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {error && (
                                    <div className="error-message" style={{
                                        backgroundColor: '#ffebee',
                                        color: '#c62828',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        marginBottom: '15px'
                                    }}>
                                        {error}
                                    </div>
                                )}
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Reserva</label>
                                        <select
                                            name="reservaId"
                                            value={formData.reservaId}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading || selectedPago}
                                        >
                                            <option value="">Seleccionar reserva</option>
                                            {reservas.map(reserva => (
                                                <option key={reserva.id} value={reserva.id}>
                                                    {reserva.clienteNombre} - {reserva.espacioNombre}
                                                    ({new Date(reserva.fechaEvento).toLocaleDateString()})
                                                    - Saldo: ${reserva.saldoPendiente.toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Tipo de Pago</label>
                                        <select
                                            name="tipoPago"
                                            value={formData.tipoPago}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        >
                                            {tiposPago.map(tipo => (
                                                <option key={tipo.value} value={tipo.value}>
                                                    {tipo.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Monto ($)</label>
                                        <input
                                            type="number"
                                            name="monto"
                                            value={formData.monto}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Método de Pago</label>
                                        <select
                                            name="metodoPago"
                                            value={formData.metodoPago}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        >
                                            {metodosPago.map(metodo => (
                                                <option key={metodo} value={metodo}>
                                                    {metodo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Fecha de Pago</label>
                                        <input
                                            type="date"
                                            name="fechaPago"
                                            value={formData.fechaPago}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Número de Comprobante</label>
                                        <input
                                            type="text"
                                            name="comprobante"
                                            value={formData.comprobante}
                                            onChange={handleInputChange}
                                            placeholder="Ej: TRF-001-2025"
                                            disabled={loading}
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
                                        placeholder="Información adicional sobre el pago..."
                                        disabled={loading}
                                    />
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
                                    {loading ? 'Guardando...' : (selectedPago ? 'Actualizar' : 'Registrar')} Pago
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Pagos;