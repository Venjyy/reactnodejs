import React, { useState, useEffect, useCallback } from 'react';
import './Sections.css';

function Reportes() {
    const [reporteData, setReporteData] = useState({
        ventasPorMes: [],
        espaciosMasReservados: [],
        serviciosMasContratados: [],
        clientesTopPorIngresos: [],
        estadisticasGenerales: {}
    });
    const [filtroFecha, setFiltroFecha] = useState({
        desde: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        hasta: new Date().toISOString().split('T')[0]
    });
    const [tipoReporte, setTipoReporte] = useState('resumen');
    const [loading, setLoading] = useState(false);

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
                clientesTopPorIngresos
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
                clientesTopPorIngresos
            });

            console.log('Datos de reportes cargados individualmente desde BD');
        } catch (error) {
            console.error('Error al cargar datos individuales:', error);
            // Mantener datos vacíos en caso de error total
            setReporteData({
                ventasPorMes: [],
                espaciosMasReservados: [],
                serviciosMasContratados: [],
                clientesTopPorIngresos: [],
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
        }
    }, [filtroFecha]); // Agregar filtroFecha como dependencia

    // SEGUNDO: Declarar loadReporteData con useCallback DESPUÉS de loadReporteDataIndividual
    const loadReporteData = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Cargando datos de reportes con filtros:', filtroFecha);

            const response = await fetch(`http://localhost:3001/api/reportes/datos-completos?desde=${filtroFecha.desde}&hasta=${filtroFecha.hasta}`);

            if (response.ok) {
                const data = await response.json();
                console.log('Datos de reportes cargados desde BD:', data);
                setReporteData(data);
            } else {
                console.error('Error al cargar datos de reportes:', response.statusText);
                // Fallback a datos individuales si el endpoint consolidado falla
                await loadReporteDataIndividual();
            }
        } catch (error) {
            console.error('Error cargando datos de reportes:', error);
            // Fallback a datos individuales
            await loadReporteDataIndividual();
        } finally {
            setLoading(false);
        }
    }, [filtroFecha, loadReporteDataIndividual]); // Agregar ambas dependencias

    // TERCERO: useEffect después de todas las declaraciones
    useEffect(() => {
        loadReporteData();
    }, [loadReporteData]);

    const handleFiltroChange = (e) => {
        setFiltroFecha({
            ...filtroFecha,
            [e.target.name]: e.target.value
        });
    };

    const exportarReporte = (formato) => {
        console.log(`Exportando reporte en formato ${formato}:`, reporteData);
        // Aquí iría la lógica de exportación
        alert(`Reporte exportado en formato ${formato.toUpperCase()}`);
    };

    const renderResumenGeneral = () => (
        <div className="reportes-content">
            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <div>
                        <h3>${(reporteData.estadisticasGenerales.totalIngresos || 0).toLocaleString()}</h3>
                        <p>Ingresos Totales</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>{reporteData.estadisticasGenerales.totalReservas || 0}</h3>
                        <p>Total Reservas</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div>
                        <h3>{reporteData.estadisticasGenerales.tasaOcupacion || 0}%</h3>
                        <p>Tasa de Ocupación</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📈</span>
                    <div>
                        <h3>{reporteData.estadisticasGenerales.crecimientoMensual >= 0 ? '+' : ''}{reporteData.estadisticasGenerales.crecimientoMensual || 0}%</h3>
                        <p>Crecimiento Mensual</p>
                    </div>
                </div>
            </div>

            <div className="reportes-grid">
                <div className="reporte-card">
                    <h3>📈 Ventas por Mes</h3>
                    <div className="chart-placeholder">
                        {reporteData.ventasPorMes.length > 0 ? (
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
                        {reporteData.espaciosMasReservados.length > 0 ? (
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
                        {reporteData.serviciosMasContratados.length > 0 ? (
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
                        {reporteData.clientesTopPorIngresos.length > 0 ? (
                            reporteData.clientesTopPorIngresos.map((cliente, index) => (
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
                    {reporteData.ventasPorMes.length > 0 ? (
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
                {reporteData.espaciosMasReservados.length > 0 ? (
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
                        📄 PDF
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={() => exportarReporte('excel')}
                    >
                        📊 Excel
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
        </div>
    );
}

export default Reportes;