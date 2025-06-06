import React, { useState, useEffect } from 'react';
import './Sections.css';

function Pagos() {
    const [pagos, setPagos] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPago, setSelectedPago] = useState(null);
    const [formData, setFormData] = useState({
        reservaId: '',
        monto: '',
        metodoPago: '',
        fechaPago: '',
        tipoPago: 'anticipo',
        comprobante: '',
        observaciones: ''
    });

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
    }, []);

    const loadPagos = async () => {
        try {
            const mockData = [
                {
                    id: 1,
                    reservaId: 1,
                    clienteNombre: 'María González',
                    espacioNombre: 'Salón Principal',
                    fechaEvento: '2025-06-20',
                    monto: 480000,
                    metodoPago: 'Transferencia Bancaria',
                    fechaPago: '2025-05-15',
                    tipoPago: 'anticipo',
                    estado: 'confirmado',
                    comprobante: 'TRF-001-2025',
                    observaciones: 'Anticipo del 50% confirmado',
                    costoTotal: 960000,
                    montoPagado: 480000,
                    saldoPendiente: 480000
                },
                {
                    id: 2,
                    reservaId: 2,
                    clienteNombre: 'Carlos Pérez',
                    espacioNombre: 'Salón VIP',
                    fechaEvento: '2025-07-05',
                    monto: 300000,
                    metodoPago: 'Efectivo',
                    fechaPago: '2025-06-01',
                    tipoPago: 'anticipo',
                    estado: 'confirmado',
                    comprobante: 'REC-002-2025',
                    observaciones: 'Anticipo en efectivo',
                    costoTotal: 1120000,
                    montoPagado: 300000,
                    saldoPendiente: 820000
                },
                {
                    id: 3,
                    reservaId: 3,
                    clienteNombre: 'Ana López',
                    espacioNombre: 'Sala de Reuniones',
                    fechaEvento: '2025-06-15',
                    monto: 330000,
                    metodoPago: 'Tarjeta de Crédito',
                    fechaPago: '2025-05-20',
                    tipoPago: 'pago_total',
                    estado: 'confirmado',
                    comprobante: 'TC-003-2025',
                    observaciones: 'Pago completo por adelantado',
                    costoTotal: 330000,
                    montoPagado: 330000,
                    saldoPendiente: 0
                },
                {
                    id: 4,
                    reservaId: 1,
                    clienteNombre: 'María González',
                    espacioNombre: 'Salón Principal',
                    fechaEvento: '2025-06-20',
                    monto: 480000,
                    metodoPago: 'Transferencia Bancaria',
                    fechaPago: '2025-06-18',
                    tipoPago: 'saldo_final',
                    estado: 'pendiente',
                    comprobante: '',
                    observaciones: 'Saldo final pendiente para día del evento',
                    costoTotal: 960000,
                    montoPagado: 480000,
                    saldoPendiente: 480000
                }
            ];
            setPagos(mockData);
        } catch (error) {
            console.error('Error cargando pagos:', error);
        }
    };

    const loadReservas = async () => {
        try {
            const mockReservas = [
                {
                    id: 1,
                    clienteNombre: 'María González',
                    espacioNombre: 'Salón Principal',
                    fechaEvento: '2025-06-20',
                    costoTotal: 960000,
                    saldoPendiente: 480000
                },
                {
                    id: 2,
                    clienteNombre: 'Carlos Pérez',
                    espacioNombre: 'Salón VIP',
                    fechaEvento: '2025-07-05',
                    costoTotal: 1120000,
                    saldoPendiente: 820000
                }
            ];
            setReservas(mockReservas);
        } catch (error) {
            console.error('Error cargando reservas:', error);
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
            if (selectedPago) {
                console.log('Actualizando pago:', formData);
            } else {
                console.log('Registrando nuevo pago:', formData);
            }
            closeModal();
            loadPagos();
        } catch (error) {
            console.error('Error al guardar pago:', error);
        }
    };

    const openModal = (pago = null) => {
        if (pago) {
            setSelectedPago(pago);
            setFormData({
                reservaId: pago.reservaId,
                monto: pago.monto,
                metodoPago: pago.metodoPago,
                fechaPago: pago.fechaPago,
                tipoPago: pago.tipoPago,
                comprobante: pago.comprobante,
                observaciones: pago.observaciones
            });
        } else {
            setSelectedPago(null);
            setFormData({
                reservaId: '',
                monto: '',
                metodoPago: '',
                fechaPago: new Date().toISOString().split('T')[0],
                tipoPago: 'abono',
                comprobante: '',
                observaciones: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPago(null);
    };

    const confirmarPago = async (id) => {
        try {
            console.log('Confirmando pago:', id);
            loadPagos();
        } catch (error) {
            console.error('Error al confirmar pago:', error);
        }
    };

    const calcularEstadisticas = () => {
        const totalIngresos = pagos
            .filter(p => p.estado === 'confirmado')
            .reduce((sum, p) => sum + p.monto, 0);

        const pagosPendientes = pagos
            .filter(p => p.estado === 'pendiente')
            .reduce((sum, p) => sum + p.monto, 0);

        const pagosHoy = pagos
            .filter(p => p.fechaPago === new Date().toISOString().split('T')[0])
            .reduce((sum, p) => sum + p.monto, 0);

        return { totalIngresos, pagosPendientes, pagosHoy };
    };

    const stats = calcularEstadisticas();

    const filteredPagos = pagos.filter(pago => {
        const matchesSearch = pago.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pago.espacioNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pago.comprobante.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'todos' || pago.estado === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-content">
                    <h1>
                        <span className="section-icon">💰</span>
                        Control de Pagos
                    </h1>
                    <p>Gestiona los pagos y abonos de las reservas</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <span>➕</span>
                    Registrar Pago
                </button>
            </div>

            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <div>
                        <h3>${stats.totalIngresos.toLocaleString()}</h3>
                        <p>Ingresos Confirmados</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">⏳</span>
                    <div>
                        <h3>${stats.pagosPendientes.toLocaleString()}</h3>
                        <p>Pagos Pendientes</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>${stats.pagosHoy.toLocaleString()}</h3>
                        <p>Cobros Hoy</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div>
                        <h3>{pagos.length}</h3>
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
                                            {tiposPago.find(t => t.value === pago.tipoPago)?.label}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${estadosPago.find(e => e.value === pago.estado)?.color}`}>
                                            {estadosPago.find(e => e.value === pago.estado)?.label}
                                        </span>
                                    </td>
                                    <td>
                                        <strong className={pago.saldoPendiente > 0 ? 'text-danger' : 'text-success'}>
                                            ${pago.saldoPendiente.toLocaleString()}
                                        </strong>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-view">👁️</button>
                                            <button className="btn-edit" onClick={() => openModal(pago)}>✏️</button>
                                            {pago.estado === 'pendiente' && (
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => confirmarPago(pago.id)}
                                                    title="Confirmar pago"
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
                            <h2>{selectedPago ? 'Editar Pago' : 'Registrar Nuevo Pago'}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Reserva</label>
                                        <select
                                            name="reservaId"
                                            value={formData.reservaId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Seleccionar reserva</option>
                                            {reservas.map(reserva => (
                                                <option key={reserva.id} value={reserva.id}>
                                                    {reserva.clienteNombre} - {reserva.espacioNombre}
                                                    ({new Date(reserva.fechaEvento).toLocaleDateString()})
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
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Método de Pago</label>
                                        <select
                                            name="metodoPago"
                                            value={formData.metodoPago}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Seleccionar método</option>
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
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {selectedPago ? 'Actualizar' : 'Registrar'} Pago
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