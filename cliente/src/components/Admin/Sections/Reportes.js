import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import './Sections.css';

function Reportes() {
    const [reporteData, setReporteData] = useState({
        ventasPorMes: [],
        espaciosMasReservados: [],
        serviciosMasContratados: [],
        clientesTopIngresos: [], // CAMBIADO: consistente con el backend
        estadisticasGenerales: {}
    });
    const [filtroFecha, setFiltroFecha] = useState({
        desde: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        hasta: new Date().toISOString().split('T')[0]
    });
    const [tipoReporte, setTipoReporte] = useState('resumen');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // NUEVOS ESTADOS PARA EXPORTACIÓN
    const [modalExportar, setModalExportar] = useState(false);
    const [opcionesExportacion, setOpcionesExportacion] = useState({
        tipoReporte: 'clientes',
        formato: 'excel',
        fechaDesde: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        fechaHasta: new Date().toISOString().split('T')[0],
        clienteIds: [],
        espacioIds: [],
        servicioIds: []
    });

    // Estados para los selectores
    const [clientesDisponibles, setClientesDisponibles] = useState([]);
    const [espaciosDisponibles, setEspaciosDisponibles] = useState([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState([]);

    // Cargar datos para los selectores
    useEffect(() => {
        cargarDatosSelectores();
    }, []);

    const cargarDatosSelectores = async () => {
        try {
            const [clientesRes, espaciosRes, serviciosRes] = await Promise.all([
                fetch('http://localhost:3001/api/clientes'),
                fetch('http://localhost:3001/api/espacios'),
                fetch('http://localhost:3001/api/servicios')
            ]);

            if (clientesRes.ok) {
                const clientes = await clientesRes.json();
                setClientesDisponibles(clientes);
            }

            if (espaciosRes.ok) {
                const espacios = await espaciosRes.json();
                setEspaciosDisponibles(espacios);
            }

            if (serviciosRes.ok) {
                const servicios = await serviciosRes.json();
                setServiciosDisponibles(servicios);
            }
        } catch (error) {
            console.error('Error cargando datos para selectores:', error);
        }
    };
    // PRIMER: Declarar showAlert con useCallback
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

    // PRIMER: Declarar loadReporteDataIndividual con useCallback
    const loadReporteDataIndividual = useCallback(async () => {
        try {
            const params = `?desde=${filtroFecha.desde}&hasta=${filtroFecha.hasta}`;

            const [
                estadisticasRes,
                ventasRes,
                espaciosRes,
                serviciosRes,
                clientesRes
            ] = await Promise.all([
                fetch(`http://localhost:3001/api/reportes/estadisticas-generales${params}`),
                fetch(`http://localhost:3001/api/reportes/ventas-por-mes${params}`),
                fetch(`http://localhost:3001/api/reportes/espacios-mas-reservados${params}`),
                fetch(`http://localhost:3001/api/reportes/servicios-mas-contratados${params}`),
                fetch(`http://localhost:3001/api/reportes/clientes-top-ingresos${params}`)
            ]);

            const [
                estadisticasGenerales,
                ventasPorMes,
                espaciosMasReservados,
                serviciosMasContratados,
                clientesTopIngresos // CAMBIADO: nombre consistente
            ] = await Promise.all([
                estadisticasRes.ok ? estadisticasRes.json() : {},
                ventasRes.ok ? ventasRes.json() : [],
                espaciosRes.ok ? espaciosRes.json() : [],
                serviciosRes.ok ? serviciosRes.json() : [],
                clientesRes.ok ? clientesRes.json() : []
            ]);

            setReporteData({
                estadisticasGenerales,
                ventasPorMes,
                espaciosMasReservados,
                serviciosMasContratados,
                clientesTopIngresos // CAMBIADO: nombre consistente
            });

            console.log('Datos de reportes cargados individualmente desde BD');
        } catch (error) {
            console.error('Error al cargar datos individuales:', error);
            // Mantener datos vacíos en caso de error total
            setReporteData({
                ventasPorMes: [],
                espaciosMasReservados: [],
                serviciosMasContratados: [],
                clientesTopIngresos: [], // CAMBIADO: nombre consistente
                estadisticasGenerales: {
                    totalIngresos: 0,
                    totalReservas: 0,
                    promedioReservaMes: 0,
                    promedioIngresoReserva: 0,
                    tasaOcupacion: 0,
                    crecimientoMensual: 0,
                    clientesActivos: 0,
                    serviciosContratados: 0
                }
            });
            setError('Error al cargar datos de reportes');
        }
    }, [filtroFecha]);

    // SEGUNDO: Declarar loadReporteData con useCallback
    const loadReporteData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Cargando datos de reportes con filtros:', filtroFecha);

            const response = await fetch(`http://localhost:3001/api/reportes/datos-completos?desde=${filtroFecha.desde}&hasta=${filtroFecha.hasta}`);

            if (response.ok) {
                const data = await response.json();
                console.log('Datos de reportes cargados desde BD:', data);

                // AGREGADO: Validar y corregir nombres de propiedades
                const dataCorregida = {
                    estadisticasGenerales: data.estadisticasGenerales || {},
                    ventasPorMes: data.ventasPorMes || [],
                    espaciosMasReservados: data.espaciosMasReservados || [],
                    serviciosMasContratados: data.serviciosMasContratados || [],
                    clientesTopIngresos: data.clientesTopIngresos || data.clientesTopPorIngresos || []
                };

                setReporteData(dataCorregida);
            } else {
                console.error('Error al cargar datos de reportes:', response.statusText);
                await loadReporteDataIndividual();
            }
        } catch (error) {
            console.error('Error cargando datos de reportes:', error);
            await loadReporteDataIndividual();
        } finally {
            setLoading(false);
        }
    }, [filtroFecha, loadReporteDataIndividual]);

    useEffect(() => {
        loadReporteData();
    }, [loadReporteData]);

    const handleFiltroChange = (e) => {
        setFiltroFecha({
            ...filtroFecha,
            [e.target.name]: e.target.value
        });
    };

    // NUEVAS FUNCIONES PARA EXPORTACIÓN
    const exportarReporte = (formato) => {
        setOpcionesExportacion(prev => ({ ...prev, formato }));
        setModalExportar(true);
    };

    const ejecutarExportacion = async () => {
        try {
            setLoading(true);

            // Mostrar alerta de inicio de exportación
            await showAlert({
                title: '📊 Iniciando Exportación',
                html: `
                    <div style="text-align: center;">
                        <p>Preparando reporte de <strong>${opcionesExportacion.tipoReporte}</strong></p>
                        <div style="margin: 15px 0; padding: 10px; background-color: #e3f2fd; border-radius: 4px;">
                            <small>🔄 Procesando datos...</small>
                        </div>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#2196f3',
                timer: 2000,
                timerProgressBar: true
            });

            const response = await fetch('http://localhost:3001/api/reportes/exportar-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(opcionesExportacion)
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;

                const extension = opcionesExportacion.formato === 'excel' ? 'xlsx' : 'pdf';
                const fileName = `reporte_${opcionesExportacion.tipoReporte}_${new Date().toISOString().split('T')[0]}.${extension}`;
                a.download = fileName;

                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setModalExportar(false);

                // REEMPLAZAR alert() por SweetAlert2
                await showAlert({
                    title: '¡Exportación Exitosa! 🎉',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>El reporte ha sido exportado exitosamente:</strong></p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li><strong>Tipo:</strong> ${opcionesExportacion.tipoReporte.charAt(0).toUpperCase() + opcionesExportacion.tipoReporte.slice(1)}</li>
                                <li><strong>Formato:</strong> ${extension.toUpperCase()}</li>
                                <li><strong>Archivo:</strong> ${fileName}</li>
                                <li><strong>Período:</strong> ${opcionesExportacion.fechaDesde} a ${opcionesExportacion.fechaHasta}</li>
                            </ul>
                            <div style="margin-top: 15px; padding: 10px; background-color: #d4edda; border-radius: 4px; border-left: 4px solid #28a745;">
                                <small>✅ El archivo se ha descargado automáticamente</small>
                            </div>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Perfecto',
                    confirmButtonColor: '#28a745',
                    timer: 6000,
                    timerProgressBar: true
                });

            } else {
                throw new Error('Error al exportar el reporte');
            }
        } catch (error) {
            console.error('Error en la exportación:', error);
            setModalExportar(false);

            // REEMPLAZAR alert() por SweetAlert2 para errores
            await showAlert({
                title: 'Error en la Exportación ❌',
                html: `
                    <div style="text-align: left;">
                        <p><strong>No se pudo completar la exportación del reporte:</strong></p>
                        <div style="margin: 15px 0; padding: 10px; background-color: #f8d7da; border-radius: 4px; border-left: 4px solid #dc3545;">
                            <small><strong>Error:</strong> ${error.message || 'Error desconocido'}</small>
                        </div>
                        <div style="margin-top: 10px;">
                            <p><strong>Posibles soluciones:</strong></p>
                            <ul style="margin: 5px 0; padding-left: 20px;">
                                <li>Verifique su conexión a internet</li>
                                <li>Intente nuevamente en unos momentos</li>
                                <li>Verifique que el servidor esté funcionando</li>
                                <li>Contacte al administrador si el problema persiste</li>
                            </ul>
                        </div>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc3545',
                allowOutsideClick: true
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpcionExportacion = (campo, valor) => {
        setOpcionesExportacion(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const handleSeleccionMultiple = (campo, valor, seleccionado) => {
        setOpcionesExportacion(prev => ({
            ...prev,
            [campo]: seleccionado
                ? [...prev[campo], valor]
                : prev[campo].filter(id => id !== valor)
        }));
    };

    const renderResumenGeneral = () => (
        <div className="reportes-content">
            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <div>
                        <h3>${(reporteData.estadisticasGenerales?.totalIngresos || 0).toLocaleString()}</h3>
                        <p>Ingresos Totales</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>{reporteData.estadisticasGenerales?.totalReservas || 0}</h3>
                        <p>Total Reservas</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div>
                        <h3>{reporteData.estadisticasGenerales?.tasaOcupacion || 0}%</h3>
                        <p>Tasa de Ocupación</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📈</span>
                    <div>
                        <h3>{(reporteData.estadisticasGenerales?.crecimientoMensual || 0) >= 0 ? '+' : ''}{reporteData.estadisticasGenerales?.crecimientoMensual || 0}%</h3>
                        <p>Crecimiento Mensual</p>
                    </div>
                </div>
            </div>

            <div className="reportes-grid">
                <div className="reporte-card">
                    <h3>📈 Ventas por Mes</h3>
                    <div className="chart-placeholder">
                        {reporteData.ventasPorMes && reporteData.ventasPorMes.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mes</th>
                                        <th>Reservas</th>
                                        <th>Ingresos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reporteData.ventasPorMes.map((mes, index) => (
                                        <tr key={index}>
                                            <td>{mes.mes}</td>
                                            <td>{mes.reservas}</td>
                                            <td>${mes.ingresos.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No hay datos de ventas para el período seleccionado</p>
                        )}
                    </div>
                </div>

                <div className="reporte-card">
                    <h3>🏢 Espacios Más Reservados</h3>
                    <div className="ranking-list">
                        {reporteData.espaciosMasReservados && reporteData.espaciosMasReservados.length > 0 ? (
                            reporteData.espaciosMasReservados.map((espacio, index) => (
                                <div key={index} className="ranking-item">
                                    <div className="ranking-position">#{index + 1}</div>
                                    <div className="ranking-info">
                                        <strong>{espacio.nombre}</strong>
                                        <small>{espacio.reservas} reservas - ${espacio.ingresos.toLocaleString()}</small>
                                    </div>
                                    <div className="ranking-percentage">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${Math.min(espacio.ocupacion, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span>{espacio.ocupacion.toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No hay datos de espacios para el período seleccionado</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="reportes-grid">
                <div className="reporte-card">
                    <h3>🎯 Servicios Más Contratados</h3>
                    <div className="ranking-list">
                        {reporteData.serviciosMasContratados && reporteData.serviciosMasContratados.length > 0 ? (
                            reporteData.serviciosMasContratados.map((servicio, index) => (
                                <div key={index} className="ranking-item">
                                    <div className="ranking-position">#{index + 1}</div>
                                    <div className="ranking-info">
                                        <strong>{servicio.nombre}</strong>
                                        <small>{servicio.contrataciones} contrataciones</small>
                                    </div>
                                    <div className="ranking-revenue">
                                        ${servicio.ingresos.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No hay datos de servicios para el período seleccionado</p>
                        )}
                    </div>
                </div>

                <div className="reporte-card">
                    <h3>👑 Clientes Top por Ingresos</h3>
                    <div className="ranking-list">
                        {reporteData.clientesTopIngresos && reporteData.clientesTopIngresos.length > 0 ? (
                            reporteData.clientesTopIngresos.map((cliente, index) => (
                                <div key={index} className="ranking-item">
                                    <div className="ranking-position">#{index + 1}</div>
                                    <div className="ranking-info">
                                        <strong>{cliente.nombre}</strong>
                                        <small>{cliente.reservas} reservas - Última: {cliente.ultimaReserva ? new Date(cliente.ultimaReserva).toLocaleDateString() : 'N/A'}</small>
                                    </div>
                                    <div className="ranking-revenue">
                                        ${cliente.ingresos.toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No hay datos de clientes para el período seleccionado</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderReporteVentas = () => (
        <div className="reportes-content">
            <h3>📊 Reporte Detallado de Ventas</h3>
            <div className="section-content">
                <div className="data-table">
                    {reporteData.ventasPorMes && reporteData.ventasPorMes.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Período</th>
                                    <th>Reservas</th>
                                    <th>Ingresos</th>
                                    <th>Promedio por Reserva</th>
                                    <th>Crecimiento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reporteData.ventasPorMes.map((mes, index) => {
                                    const crecimiento = index > 0 && reporteData.ventasPorMes[index - 1].ingresos > 0
                                        ? ((mes.ingresos - reporteData.ventasPorMes[index - 1].ingresos) / reporteData.ventasPorMes[index - 1].ingresos * 100).toFixed(1)
                                        : 0;
                                    const promedioPorReserva = mes.reservas > 0 ? (mes.ingresos / mes.reservas) : 0;

                                    return (
                                        <tr key={index}>
                                            <td>{mes.mes}</td>
                                            <td>{mes.reservas}</td>
                                            <td>${mes.ingresos.toLocaleString()}</td>
                                            <td>${promedioPorReserva.toLocaleString()}</td>
                                            <td className={crecimiento >= 0 ? 'text-success' : 'text-danger'}>
                                                {crecimiento >= 0 ? '+' : ''}{crecimiento}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <p>No hay datos de ventas para el período seleccionado</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderReporteOcupacion = () => (
        <div className="reportes-content">
            <h3>🏢 Reporte de Ocupación de Espacios</h3>
            <div className="reportes-grid">
                {reporteData.espaciosMasReservados && reporteData.espaciosMasReservados.length > 0 ? (
                    reporteData.espaciosMasReservados.map((espacio, index) => (
                        <div key={index} className="space-ocupacion-card">
                            <h4>{espacio.nombre}</h4>
                            <div className="ocupacion-stats">
                                <div className="ocupacion-circle">
                                    <svg width="120" height="120">
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            stroke="#eee"
                                            strokeWidth="10"
                                            fill="none"
                                        />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="50"
                                            stroke="#667eea"
                                            strokeWidth="10"
                                            fill="none"
                                            strokeDasharray={`${Math.min(espacio.ocupacion, 100) * 3.14} 314`}
                                            transform="rotate(-90 60 60)"
                                        />
                                        <text
                                            x="60"
                                            y="60"
                                            textAnchor="middle"
                                            dy="0.3em"
                                            fontSize="18"
                                            fontWeight="bold"
                                        >
                                            {espacio.ocupacion.toFixed(1)}%
                                        </text>
                                    </svg>
                                </div>
                                <div className="ocupacion-details">
                                    <p><strong>{espacio.reservas}</strong> reservas</p>
                                    <p><strong>${espacio.ingresos.toLocaleString()}</strong> ingresos</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay datos de ocupación para el período seleccionado</p>
                )}
            </div>
        </div>
    );

    // MODAL DE EXPORTACIÓN
    const renderModalExportacion = () => (
        modalExportar && (
            <div className="modal-overlay" onClick={() => setModalExportar(false)}>
                <div className="modal-content exportacion-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>📊 Exportar Reporte</h2>
                        <button className="close-btn" onClick={() => setModalExportar(false)}>×</button>
                    </div>

                    <div className="modal-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tipo de Reporte</label>
                                <select
                                    value={opcionesExportacion.tipoReporte}
                                    onChange={(e) => handleOpcionExportacion('tipoReporte', e.target.value)}
                                >
                                    <option value="clientes">Clientes</option>
                                    <option value="espacios">Espacios</option>
                                    <option value="servicios">Servicios</option>
                                    <option value="reservas">Reservas</option>
                                    <option value="pagos">Pagos</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Formato</label>
                                <select
                                    value={opcionesExportacion.formato}
                                    onChange={(e) => handleOpcionExportacion('formato', e.target.value)}
                                >
                                    <option value="excel">Excel (.xlsx)</option>
                                    <option value="pdf">PDF (.pdf)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Fecha Desde</label>
                                <input
                                    type="date"
                                    value={opcionesExportacion.fechaDesde}
                                    onChange={(e) => handleOpcionExportacion('fechaDesde', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Fecha Hasta</label>
                                <input
                                    type="date"
                                    value={opcionesExportacion.fechaHasta}
                                    onChange={(e) => handleOpcionExportacion('fechaHasta', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Selectores específicos según tipo de reporte */}
                        {(opcionesExportacion.tipoReporte === 'clientes' || opcionesExportacion.tipoReporte === 'reservas' || opcionesExportacion.tipoReporte === 'pagos') && (
                            <div className="form-group">
                                <label>Clientes Específicos (opcional)</label>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={opcionesExportacion.clienteIds.length === 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleOpcionExportacion('clienteIds', []);
                                                }
                                            }}
                                        />
                                        Todos los clientes
                                    </label>
                                    {clientesDisponibles.map(cliente => (
                                        <label key={cliente.id}>
                                            <input
                                                type="checkbox"
                                                checked={opcionesExportacion.clienteIds.includes(cliente.id)}
                                                onChange={(e) => handleSeleccionMultiple('clienteIds', cliente.id, e.target.checked)}
                                            />
                                            {cliente.nombre} ({cliente.rut})
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(opcionesExportacion.tipoReporte === 'espacios' || opcionesExportacion.tipoReporte === 'reservas' || opcionesExportacion.tipoReporte === 'pagos') && (
                            <div className="form-group">
                                <label>Espacios Específicos (opcional)</label>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={opcionesExportacion.espacioIds.length === 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleOpcionExportacion('espacioIds', []);
                                                }
                                            }}
                                        />
                                        Todos los espacios
                                    </label>
                                    {espaciosDisponibles.map(espacio => (
                                        <label key={espacio.id}>
                                            <input
                                                type="checkbox"
                                                checked={opcionesExportacion.espacioIds.includes(espacio.id)}
                                                onChange={(e) => handleSeleccionMultiple('espacioIds', espacio.id, e.target.checked)}
                                            />
                                            {espacio.nombre}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {opcionesExportacion.tipoReporte === 'servicios' && (
                            <div className="form-group">
                                <label>Servicios Específicos (opcional)</label>
                                <div className="checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={opcionesExportacion.servicioIds.length === 0}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    handleOpcionExportacion('servicioIds', []);
                                                }
                                            }}
                                        />
                                        Todos los servicios
                                    </label>
                                    {serviciosDisponibles.map(servicio => (
                                        <label key={servicio.id}>
                                            <input
                                                type="checkbox"
                                                checked={opcionesExportacion.servicioIds.includes(servicio.id)}
                                                onChange={(e) => handleSeleccionMultiple('servicioIds', servicio.id, e.target.checked)}
                                            />
                                            {servicio.nombre}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn-secondary"
                            onClick={() => setModalExportar(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn-primary"
                            onClick={ejecutarExportacion}
                            disabled={loading}
                        >
                            {loading ? 'Exportando...' : `Exportar ${opcionesExportacion.formato.toUpperCase()}`}
                        </button>
                    </div>
                </div>
            </div>
        )
    );

    if (loading) {
        return (
            <div className="section-container">
                <div className="loading-container">
                    <p>Cargando datos de reportes...</p>
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
                        <span className="section-icon">📈</span>
                        Reportes y Estadísticas
                    </h1>
                    <p>Visualiza reportes detallados del negocio</p>
                </div>
                <div className="header-actions">
                    <select
                        value={tipoReporte}
                        onChange={(e) => setTipoReporte(e.target.value)}
                        className="search-input"
                        style={{ marginRight: '10px' }}
                    >
                        <option value="resumen">Resumen General</option>
                        <option value="ventas">Reporte de Ventas</option>
                        <option value="ocupacion">Ocupación de Espacios</option>
                    </select>
                    <button
                        className="btn-secondary"
                        onClick={() => exportarReporte('pdf')}
                        style={{ marginRight: '10px' }}
                    >
                        📄 Exportar PDF
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => exportarReporte('excel')}
                    >
                        📊 Exportar Excel
                    </button>
                </div>
            </div>

            <div className="filtros-reporte">
                <div className="form-row">
                    <div className="form-group">
                        <label>Fecha Desde</label>
                        <input
                            type="date"
                            name="desde"
                            value={filtroFecha.desde}
                            onChange={handleFiltroChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Fecha Hasta</label>
                        <input
                            type="date"
                            name="hasta"
                            value={filtroFecha.hasta}
                            onChange={handleFiltroChange}
                        />
                    </div>
                    <div className="form-group">
                        <button
                            className="btn-primary"
                            onClick={loadReporteData}
                            style={{ marginTop: '25px' }}
                        >
                            🔄 Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {tipoReporte === 'resumen' && renderResumenGeneral()}
            {tipoReporte === 'ventas' && renderReporteVentas()}
            {tipoReporte === 'ocupacion' && renderReporteOcupacion()}

            {/* Modal de exportación */}
            {renderModalExportacion()}
        </div>
    );
}

export default Reportes;