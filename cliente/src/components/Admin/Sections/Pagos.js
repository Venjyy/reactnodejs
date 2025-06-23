import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import './Sections.css';

function Pagos() {
    const [pagos, setPagos] = useState([]);
    const [reservas, setReservas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPago, setSelectedPago] = useState(null);
    const [loading, setLoading] = useState(false);
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

    const loadPagos = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Intentando cargar pagos desde:', `${API_BASE_URL}/api/pagos`);
            const response = await fetch(`${API_BASE_URL}/api/pagos`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                await showAlert({
                    title: 'Error al cargar pagos',
                    text: `Error ${response.status}: ${response.statusText}`,
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
                setPagos([]);
                return;
            }

            const data = await response.json();
            setPagos(data);
            console.log('Pagos cargados exitosamente:', data);
        } catch (error) {
            console.error('Error cargando pagos:', error);
            await showAlert({
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor para cargar los pagos',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
            setPagos([]);
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    const loadReservas = useCallback(async () => {
        try {
            console.log('Intentando cargar reservas desde:', `${API_BASE_URL}/api/reservas-para-pagos`);
            const response = await fetch(`${API_BASE_URL}/api/reservas-para-pagos`);

            if (!response.ok) {
                console.error('Error al cargar reservas:', response.statusText);
                setReservas([]);
                return;
            }

            const data = await response.json();
            setReservas(data);
            console.log('Reservas cargadas exitosamente:', data);
        } catch (error) {
            console.error('Error cargando reservas:', error);
            setReservas([]);
        }
    }, []);

    const loadEstadisticas = useCallback(async () => {
        try {
            console.log('Intentando cargar estadísticas desde:', `${API_BASE_URL}/api/pagos/estadisticas`);
            const response = await fetch(`${API_BASE_URL}/api/pagos/estadisticas`);

            if (!response.ok) {
                console.error('Error al cargar estadísticas:', response.statusText);
                setStats({
                    totalIngresos: 0,
                    totalTransacciones: 0,
                    pagosHoy: 0,
                    pagosPendientes: 0
                });
                return;
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
    }, []);

    useEffect(() => {
        loadPagos();
        loadReservas();
        loadEstadisticas();
    }, [loadPagos, loadReservas, loadEstadisticas]);

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
            reservaId: 'Reserva',
            monto: 'Monto',
            metodoPago: 'Método de Pago',
            fechaPago: 'Fecha de Pago',
            tipoPago: 'Tipo de Pago',
            comprobante: 'Comprobante',
            observaciones: 'Observaciones'
        };

        Object.keys(fieldsToCompare).forEach(field => {
            let originalValue = original[field];
            let updatedValue = updated[field];

            // Normalizar fechas para comparación correcta
            if (field === 'fechaPago') {
                // Convertir ambas fechas al formato YYYY-MM-DD para comparar
                if (originalValue) {
                    if (originalValue instanceof Date) {
                        originalValue = originalValue.toISOString().split('T')[0];
                    } else if (typeof originalValue === 'string') {
                        // Si viene como timestamp "2025-06-10T00:00:00.000Z", extraer solo la fecha
                        if (originalValue.includes('T')) {
                            originalValue = originalValue.split('T')[0];
                        }
                        // Si ya está en formato YYYY-MM-DD, mantenerla
                        if (originalValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            // Ya está en el formato correcto
                        }
                    }
                }

                if (updatedValue) {
                    if (updatedValue instanceof Date) {
                        updatedValue = updatedValue.toISOString().split('T')[0];
                    } else if (typeof updatedValue === 'string') {
                        // Si viene como timestamp, extraer solo la fecha
                        if (updatedValue.includes('T')) {
                            updatedValue = updatedValue.split('T')[0];
                        }
                    }
                }
            }

            // Comparar valores normalizados
            if (originalValue !== updatedValue) {
                if (field === 'reservaId') {
                    const reservaOriginal = reservas.find(r => r.id === originalValue);
                    const reservaNueva = reservas.find(r => r.id === updatedValue);
                    const nombreOriginal = reservaOriginal ? `${reservaOriginal.clienteNombre} - ${reservaOriginal.espacioNombre}` : 'No especificada';
                    const nombreNuevo = reservaNueva ? `${reservaNueva.clienteNombre} - ${reservaNueva.espacioNombre}` : 'No especificada';
                    changes.push(`${fieldsToCompare[field]}: "${nombreOriginal}" → "${nombreNuevo}"`);
                } else if (field === 'monto') {
                    changes.push(`${fieldsToCompare[field]}: $${Number(originalValue).toLocaleString()} → $${Number(updatedValue).toLocaleString()}`);
                } else if (field === 'fechaPago') {
                    // Usar las fechas normalizadas para mostrar el cambio
                    const fechaOriginal = originalValue ? new Date(originalValue + 'T00:00:00').toLocaleDateString('es-CL') : 'No especificada';
                    const fechaNueva = updatedValue ? new Date(updatedValue + 'T00:00:00').toLocaleDateString('es-CL') : 'No especificada';
                    changes.push(`${fieldsToCompare[field]}: "${fechaOriginal}" → "${fechaNueva}"`);
                } else if (field === 'tipoPago') {
                    const tipoOriginal = tiposPago.find(t => t.value === originalValue)?.label || originalValue;
                    const tipoNuevo = tiposPago.find(t => t.value === updatedValue)?.label || updatedValue;
                    changes.push(`${fieldsToCompare[field]}: "${tipoOriginal}" → "${tipoNuevo}"`);
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
                    tipoPago: formData.tipoPago,
                    comprobante: formData.comprobante,
                    observaciones: formData.observaciones
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error al guardar pago:', errorData.error);
                closeModal();
                await showAlert({
                    title: 'Error al guardar',
                    text: errorData.error || 'No se pudo guardar el pago',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }

            const result = await response.json();
            console.log(selectedPago ? 'Pago actualizado:' : 'Pago creado:', result);
            closeModal();

            if (selectedPago) {
                // Es una edición - mostrar cambios realizados
                const changes = getChanges(selectedPago, formData);

                if (changes.length > 0) {
                    await showAlert({
                        title: '¡Pago Actualizado!',
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
                        text: 'No se detectaron cambios en el pago',
                        icon: 'info',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#17a2b8',
                        timer: 3000,
                        timerProgressBar: true
                    });
                }
            } else {
                // Es una creación
                const reserva = reservas.find(r => r.id === parseInt(formData.reservaId));
                const tipoPago = tiposPago.find(t => t.value === formData.tipoPago);

                await showAlert({
                    title: '¡Pago Registrado!',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>Nuevo pago registrado exitosamente:</strong></p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Cliente: ${reserva?.clienteNombre || 'No especificado'}</li>
                                <li>Espacio: ${reserva?.espacioNombre || 'No especificado'}</li>
                                <li>Monto: $${Number(formData.monto).toLocaleString()}</li>
                                <li>Método: ${formData.metodoPago}</li>
                                <li>Fecha: ${new Date(formData.fechaPago).toLocaleDateString('es-CL')}</li>
                                <li>Tipo: ${tipoPago?.label || 'Abono'}</li>
                                ${formData.comprobante ? `<li>Comprobante: ${formData.comprobante}</li>` : ''}
                                ${reserva ? `<li>Saldo Restante: $${(reserva.saldoPendiente - Number(formData.monto)).toLocaleString()}</li>` : ''}
                            </ul>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    timer: 5000,
                    timerProgressBar: true
                });
            }

            await loadPagos();
            await loadReservas();
            await loadEstadisticas();

        } catch (error) {
            console.error('Error al guardar pago:', error);
            closeModal();
            await showAlert({
                title: 'Error de conexión',
                text: 'Error al guardar el pago. Verifique su conexión.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, clienteNombre, monto, fechaPago) => {
        const result = await showAlert({
            title: '¿Eliminar pago?',
            html: `
                <div style="text-align: left;">
                    <p>¿Estás seguro de que deseas eliminar este pago?</p>
                    <div style="margin: 15px 0; padding: 10px; background-color: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
                        <strong>⚠️ Esta acción no se puede deshacer</strong>
                        <ul style="margin: 8px 0; padding-left: 20px;">
                            <li>Cliente: <strong>${clienteNombre}</strong></li>
                            <li>Monto: <strong style="color: #dc3545;">$${monto.toLocaleString()}</strong></li>
                            <li>Fecha: ${new Date(fechaPago).toLocaleDateString('es-CL')}</li>
                            <li>Se eliminará permanentemente el registro</li>
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
                const response = await fetch(`${API_BASE_URL}/api/pagos/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error al eliminar pago:', errorData.error);
                    await showAlert({
                        title: 'Error al eliminar',
                        text: errorData.error || 'No se pudo eliminar el pago',
                        icon: 'error',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#dc3545'
                    });
                    return;
                }

                console.log('Pago eliminado:', id);

                await showAlert({
                    title: '¡Pago Eliminado!',
                    html: `
                        <div style="text-align: center;">
                            <p>El pago de <strong>"${clienteNombre}"</strong> por <strong>$${monto.toLocaleString()}</strong> ha sido eliminado exitosamente.</p>
                            <div style="margin-top: 15px; padding: 10px; background-color: #d4edda; border-radius: 4px;">
                                <small>✅ El registro ha sido removido del sistema</small>
                            </div>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#28a745',
                    timer: 3000,
                    timerProgressBar: true
                });

                await loadPagos();
                await loadReservas();
                await loadEstadisticas();

            } catch (error) {
                console.error('Error al eliminar pago:', error);
                await showAlert({
                    title: 'Error de conexión',
                    text: 'Error al eliminar el pago. Verifique su conexión.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const openModal = (pago = null) => {
        if (pago) {
            setSelectedPago(pago);

            // Formatear la fecha correctamente para el input date
            let fechaFormateada = '';
            if (pago.fechaPago) {
                if (typeof pago.fechaPago === 'string') {
                    // Si viene como timestamp "2025-06-10T00:00:00.000Z"
                    if (pago.fechaPago.includes('T')) {
                        fechaFormateada = pago.fechaPago.split('T')[0];
                    }
                    // Si ya viene como "2025-06-10"
                    else if (pago.fechaPago.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        fechaFormateada = pago.fechaPago;
                    }
                    // Si viene en otro formato, intentar convertir
                    else {
                        const fecha = new Date(pago.fechaPago);
                        if (!isNaN(fecha.getTime())) {
                            fechaFormateada = fecha.toISOString().split('T')[0];
                        }
                    }
                } else if (pago.fechaPago instanceof Date) {
                    fechaFormateada = pago.fechaPago.toISOString().split('T')[0];
                }
            }

            setFormData({
                reservaId: pago.reservaId,
                monto: pago.monto,
                metodoPago: pago.metodoPago,
                fechaPago: fechaFormateada,
                tipoPago: pago.tipoPago,
                comprobante: pago.comprobante || '',
                observaciones: pago.observaciones || ''
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
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPago(null);
    };

    const filteredPagos = pagos.filter(pago => {
        const matchesSearch = (pago.clienteNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pago.espacioNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (pago.comprobante || '').toLowerCase().includes(searchTerm.toLowerCase());

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
                                            <strong>{pago.clienteNombre || 'Cliente no disponible'}</strong>
                                            <br />
                                            <small>{pago.espacioNombre || 'Espacio no disponible'}</small>
                                            <br />
                                            <small>Evento: {pago.fechaEvento ? new Date(pago.fechaEvento).toLocaleDateString('es-CL') : 'Sin fecha'}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>${(pago.monto || 0).toLocaleString()}</strong>
                                        <br />
                                        <small>Total: ${(pago.costoTotal || 0).toLocaleString()}</small>
                                    </td>
                                    <td>
                                        <div>
                                            {pago.metodoPago || 'Efectivo'}
                                            <br />
                                            {pago.comprobante && (
                                                <small>#{pago.comprobante}</small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString('es-CL') : 'Sin fecha'}
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
                                        <strong className={(pago.saldoPendiente || 0) > 0 ? 'text-danger' : 'text-success'}>
                                            ${(pago.saldoPendiente || 0).toLocaleString()}
                                        </strong>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => openModal(pago)}
                                                disabled={loading}
                                                title="Editar pago"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(
                                                    pago.id,
                                                    pago.clienteNombre,
                                                    pago.monto,
                                                    pago.fechaPago
                                                )}
                                                disabled={loading}
                                                title="Eliminar pago"
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
                            {searchTerm || filterStatus !== 'todos'
                                ? 'No hay pagos que coincidan con los filtros aplicados.'
                                : 'No hay pagos registrados en el sistema.'}
                        </p>
                        {!searchTerm && filterStatus === 'todos' && (
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
                                                    ({reserva.fechaEvento ? new Date(reserva.fechaEvento).toLocaleDateString('es-CL') : 'Sin fecha'})
                                                    - Saldo: ${(reserva.saldoPendiente || 0).toLocaleString()}
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