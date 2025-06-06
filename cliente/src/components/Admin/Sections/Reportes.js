import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        loadReporteData();
    }, [filtroFecha]);

    const loadReporteData = async () => {
        try {
            // Simulación de datos de reportes
            const mockData = {
                ventasPorMes: [
                    { mes: 'Enero 2025', ingresos: 4200000, reservas: 18 },
                    { mes: 'Febrero 2025', ingresos: 3800000, reservas: 15 },
                    { mes: 'Marzo 2025', ingresos: 5100000, reservas: 22 },
                    { mes: 'Abril 2025', ingresos: 4600000, reservas: 19 },
                    { mes: 'Mayo 2025', ingresos: 5500000, reservas: 25 },
                    { mes: 'Junio 2025', ingresos: 2500000, reservas: 12 }
                ],
                espaciosMasReservados: [
                    { nombre: 'Salón Principal', reservas: 45, ingresos: 17100000, ocupacion: 85 },
                    { nombre: 'Salón VIP', reservas: 28, ingresos: 15400000, ocupacion: 70 },
                    { nombre: 'Terraza Jardín', reservas: 18, ingresos: 5040000, ocupacion: 45 },
                    { nombre: 'Sala de Reuniones', reservas: 20, ingresos: 3000000, ocupacion: 60 }
                ],
                serviciosMasContratados: [
                    { nombre: 'Catering Premium', contrataciones: 52, ingresos: 23400000 },
                    { nombre: 'Decoración Temática', contrataciones: 38, ingresos: 6840000 },
                    { nombre: 'Sistema de Sonido', contrataciones: 35, ingresos: 8750000 },
                    { nombre: 'Fotografía Profesional', contrataciones: 29, ingresos: 9280000 }
                ],
                clientesTopPorIngresos: [
                    { nombre: 'Eventos Corporativos SpA', reservas: 8, ingresos: 9200000, ultimaReserva: '2025-06-01' },
                    { nombre: 'María González', reservas: 12, ingresos: 7800000, ultimaReserva: '2025-06-20' },
                    { nombre: 'Fundación Los Niños', reservas: 6, ingresos: 4200000, ultimaReserva: '2025-05-15' },
                    { nombre: 'Carlos Pérez', reservas: 5, ingresos: 3900000, ultimaReserva: '2025-07-05' }
                ],
                estadisticasGenerales: {
                    totalIngresos: 25940000,
                    totalReservas: 111,
                    promedioReservaMes: 18.5,
                    promedioIngresoReserva: 233693,
                    tasaOcupacion: 65,
                    crecimientoMensual: 12.5,
                    clientesActivos: 89,
                    serviciosContratados: 154
                }
            };
            setReporteData(mockData);
        } catch (error) {
            console.error('Error cargando datos de reportes:', error);
        }
    };

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
                        <h3>${reporteData.estadisticasGenerales.totalIngresos?.toLocaleString()}</h3>
                        <p>Ingresos Totales</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>{reporteData.estadisticasGenerales.totalReservas}</h3>
                        <p>Total Reservas</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div>
                        <h3>{reporteData.estadisticasGenerales.tasaOcupacion}%</h3>
                        <p>Tasa de Ocupación</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">📈</span>
                    <div>
                        <h3>+{reporteData.estadisticasGenerales.crecimientoMensual}%</h3>
                        <p>Crecimiento Mensual</p>
                    </div>
                </div>
            </div>

            <div className="reportes-grid">
                <div className="reporte-card">
                    <h3>📈 Ventas por Mes</h3>
                    <div className="chart-placeholder">
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
                    </div>
                </div>

                <div className="reporte-card">
                    <h3>🏢 Espacios Más Reservados</h3>
                    <div className="ranking-list">
                        {reporteData.espaciosMasReservados.map((espacio, index) => (
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
                                            style={{ width: `${espacio.ocupacion}%` }}
                                        ></div>
                                    </div>
                                    <span>{espacio.ocupacion}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="reportes-grid">
                <div className="reporte-card">
                    <h3>🎯 Servicios Más Contratados</h3>
                    <div className="ranking-list">
                        {reporteData.serviciosMasContratados.map((servicio, index) => (
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
                        ))}
                    </div>
                </div>

                <div className="reporte-card">
                    <h3>👑 Clientes Top por Ingresos</h3>
                    <div className="ranking-list">
                        {reporteData.clientesTopPorIngresos.map((cliente, index) => (
                            <div key={index} className="ranking-item">
                                <div className="ranking-position">#{index + 1}</div>
                                <div className="ranking-info">
                                    <strong>{cliente.nombre}</strong>
                                    <small>{cliente.reservas} reservas - Última: {new Date(cliente.ultimaReserva).toLocaleDateString()}</small>
                                </div>
                                <div className="ranking-revenue">
                                    ${cliente.ingresos.toLocaleString()}
                                </div>
                            </div>
                        ))}
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
                                const crecimiento = index > 0
                                    ? ((mes.ingresos - reporteData.ventasPorMes[index - 1].ingresos) / reporteData.ventasPorMes[index - 1].ingresos * 100).toFixed(1)
                                    : 0;
                                return (
                                    <tr key={index}>
                                        <td>{mes.mes}</td>
                                        <td>{mes.reservas}</td>
                                        <td>${mes.ingresos.toLocaleString()}</td>
                                        <td>${(mes.ingresos / mes.reservas).toLocaleString()}</td>
                                        <td className={crecimiento >= 0 ? 'text-success' : 'text-danger'}>
                                            {crecimiento >= 0 ? '+' : ''}{crecimiento}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderReporteOcupacion = () => (
        <div className="reportes-content">
            <h3>🏢 Reporte de Ocupación de Espacios</h3>
            <div className="reportes-grid">
                {reporteData.espaciosMasReservados.map((espacio, index) => (
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
                                        strokeDasharray={`${espacio.ocupacion * 3.14} 314`}
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
                                        {espacio.ocupacion}%
                                    </text>
                                </svg>
                            </div>
                            <div className="ocupacion-details">
                                <p><strong>{espacio.reservas}</strong> reservas</p>
                                <p><strong>${espacio.ingresos.toLocaleString()}</strong> ingresos</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

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
                </div>
            </div>

            {tipoReporte === 'resumen' && renderResumenGeneral()}
            {tipoReporte === 'ventas' && renderReporteVentas()}
            {tipoReporte === 'ocupacion' && renderReporteOcupacion()}
        </div>
    );
}

export default Reportes;