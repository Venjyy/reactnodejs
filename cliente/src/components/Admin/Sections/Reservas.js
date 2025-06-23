import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import './Sections.css';

function Reservas() {
    const [reservas, setReservas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [espacios, setEspacios] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todas');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReserva, setSelectedReserva] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        clienteId: '',
        espacioId: '',
        fechaEvento: '',
        horaInicio: '',
        horaFin: '',
        tipoEvento: '',
        numeroPersonas: '',
        serviciosSeleccionados: [],
        estado: 'pendiente',
        observaciones: '',
        descuento: 0,
        anticipo: 0
    });

    const estadosReserva = [
        { value: 'pendiente', label: 'Pendiente', color: 'warning' },
        { value: 'confirmada', label: 'Confirmada', color: 'success' },
        { value: 'cancelada', label: 'Cancelada', color: 'danger' },
        { value: 'completada', label: 'Completada', color: 'info' }
    ];

    const tiposEvento = [
        'Cumpleaños',
        'Baby Shower',
        'Matrimonio',
        'Aniversario',
        'Reunión Familiar',
        'Evento Corporativo',
        'Graduación',
        'Quinceaños',
        'Bautizo',
        'Otro'
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

    const loadReservas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/reservas');
            if (response.ok) {
                const data = await response.json();
                console.log('Datos de reservas recibidos:', data);
                setReservas(data);
                console.log('Reservas cargadas desde BD:', data.length);
            } else {
                console.error('Error al cargar reservas:', response.statusText);
                const errorData = await response.json();
                console.error('Detalles del error:', errorData);
                await showAlert({
                    title: 'Error al cargar reservas',
                    text: errorData.error || 'No se pudieron cargar las reservas',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
                setReservas([]);
            }
        } catch (error) {
            console.error('Error cargando reservas:', error);
            await showAlert({
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor para cargar las reservas',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
            setReservas([]);
        } finally {
            setLoading(false);
        }
    }, [showAlert]);

    const loadClientes = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/reservas/clientes');
            if (response.ok) {
                const data = await response.json();
                setClientes(data);
                console.log('Clientes cargados desde BD:', data.length);
            } else {
                const mockClientes = [
                    { id: 1, nombre: 'María González' },
                    { id: 2, nombre: 'Carlos Pérez' },
                    { id: 3, nombre: 'Ana López' }
                ];
                setClientes(mockClientes);
            }
        } catch (error) {
            console.error('Error cargando clientes:', error);
            setClientes([]);
        }
    }, []);

    const loadEspacios = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/reservas/espacios');
            if (response.ok) {
                const data = await response.json();
                // Asegurar que todos los espacios tengan las propiedades necesarias
                const espaciosFormateados = data.map(espacio => ({
                    ...espacio,
                    costo: espacio.costo || espacio.costoBase || 0,
                    capacidad: espacio.capacidad || espacio.capacidadMaxima || 0
                }));
                setEspacios(espaciosFormateados);
                console.log('Espacios cargados desde BD:', espaciosFormateados.length);
            } else {
                const mockEspacios = [
                    { id: 1, nombre: 'Salón Principal', capacidad: 120, costo: 380000 },
                    { id: 2, nombre: 'Salón VIP', capacidad: 60, costo: 550000 },
                    { id: 3, nombre: 'Terraza Jardín', capacidad: 80, costo: 280000 },
                    { id: 4, nombre: 'Sala de Reuniones', capacidad: 25, costo: 150000 }
                ];
                setEspacios(mockEspacios);
            }
        } catch (error) {
            console.error('Error cargando espacios:', error);
            setEspacios([]);
        }
    }, []);

    const loadServicios = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/reservas/servicios');
            if (response.ok) {
                const data = await response.json();
                setServicios(data);
                console.log('Servicios cargados desde BD:', data.length);
            } else {
                const mockServicios = [
                    { id: 1, nombre: 'Catering Premium', precio: 450000 },
                    { id: 2, nombre: 'Decoración Temática', precio: 180000 },
                    { id: 3, nombre: 'Sistema de Sonido', precio: 250000 },
                    { id: 4, nombre: 'Fotografía Profesional', precio: 320000 }
                ];
                setServicios(mockServicios);
            }
        } catch (error) {
            console.error('Error cargando servicios:', error);
            setServicios([]);
        }
    }, []);

    useEffect(() => {
        loadReservas();
        loadClientes();
        loadEspacios();
        loadServicios();
    }, [loadReservas, loadClientes, loadEspacios, loadServicios]);

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleServicioChange = (servicioId) => {
        const serviciosActuales = formData.serviciosSeleccionados;
        const nuevoArray = serviciosActuales.includes(servicioId)
            ? serviciosActuales.filter(id => id !== servicioId)
            : [...serviciosActuales, servicioId];

        setFormData({
            ...formData,
            serviciosSeleccionados: nuevoArray
        });
    };

    const calcularCostoTotal = () => {
        const espacioSeleccionado = espacios.find(e => e.id === parseInt(formData.espacioId));
        const costoEspacio = espacioSeleccionado ? (espacioSeleccionado.costo || espacioSeleccionado.costoBase || 0) : 0;

        const costoServicios = formData.serviciosSeleccionados.reduce((total, servicioId) => {
            const servicio = servicios.find(s => s.id === servicioId);
            return total + (servicio ? (servicio.precio || 0) : 0);
        }, 0);

        return costoEspacio + costoServicios - (formData.descuento || 0);
    };

    // Función para comparar cambios en edición
    const getChanges = (original, updated) => {
        const changes = [];
        const fieldsToCompare = {
            clienteId: 'Cliente',
            espacioId: 'Espacio',
            fechaEvento: 'Fecha del Evento',
            horaInicio: 'Hora de Inicio',
            horaFin: 'Hora de Fin',
            tipoEvento: 'Tipo de Evento',
            numeroPersonas: 'Número de Personas',
            estado: 'Estado',
            observaciones: 'Observaciones',
            descuento: 'Descuento',
            anticipo: 'Anticipo'
        };

        Object.keys(fieldsToCompare).forEach(field => {
            const originalValue = original[field];
            const updatedValue = updated[field];

            if (originalValue !== updatedValue) {
                if (field === 'clienteId') {
                    const clienteOriginal = clientes.find(c => c.id === originalValue)?.nombre || 'No especificado';
                    const clienteNuevo = clientes.find(c => c.id === updatedValue)?.nombre || 'No especificado';
                    changes.push(`${fieldsToCompare[field]}: "${clienteOriginal}" → "${clienteNuevo}"`);
                } else if (field === 'espacioId') {
                    const espacioOriginal = espacios.find(e => e.id === originalValue)?.nombre || 'No especificado';
                    const espacioNuevo = espacios.find(e => e.id === updatedValue)?.nombre || 'No especificado';
                    changes.push(`${fieldsToCompare[field]}: "${espacioOriginal}" → "${espacioNuevo}"`);
                } else if (field === 'descuento' || field === 'anticipo') {
                    changes.push(`${fieldsToCompare[field]}: $${Number(originalValue).toLocaleString()} → $${Number(updatedValue).toLocaleString()}`);
                } else if (field === 'fechaEvento') {
                    const fechaOriginal = originalValue ? new Date(originalValue).toLocaleDateString('es-CL') : 'No especificada';
                    const fechaNueva = updatedValue ? new Date(updatedValue).toLocaleDateString('es-CL') : 'No especificada';
                    changes.push(`${fieldsToCompare[field]}: "${fechaOriginal}" → "${fechaNueva}"`);
                } else if (field === 'estado') {
                    const estadoOriginal = estadosReserva.find(e => e.value === originalValue)?.label || originalValue;
                    const estadoNuevo = estadosReserva.find(e => e.value === updatedValue)?.label || updatedValue;
                    changes.push(`${fieldsToCompare[field]}: "${estadoOriginal}" → "${estadoNuevo}"`);
                } else {
                    changes.push(`${fieldsToCompare[field]}: "${originalValue || 'Sin definir'}" → "${updatedValue || 'Sin definir'}"`);
                }
            }
        });

        // Verificar cambios en servicios seleccionados
        const serviciosOriginales = original.serviciosSeleccionados || [];
        const serviciosNuevos = updated.serviciosSeleccionados || [];

        if (JSON.stringify(serviciosOriginales.sort()) !== JSON.stringify(serviciosNuevos.sort())) {
            const nombresOriginales = serviciosOriginales.map(id => servicios.find(s => s.id === id)?.nombre || `ID:${id}`);
            const nombresNuevos = serviciosNuevos.map(id => servicios.find(s => s.id === id)?.nombre || `ID:${id}`);
            changes.push(`Servicios Adicionales: [${nombresOriginales.join(', ') || 'Ninguno'}] → [${nombresNuevos.join(', ') || 'Ninguno'}]`);
        }

        return changes;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const costoTotal = calcularCostoTotal();
            const datosReserva = {
                clienteId: parseInt(formData.clienteId),
                espacioId: parseInt(formData.espacioId),
                fechaEvento: formData.fechaEvento,
                horaInicio: formData.horaInicio,
                horaFin: formData.horaFin,
                tipoEvento: formData.tipoEvento,
                numeroPersonas: parseInt(formData.numeroPersonas),
                serviciosSeleccionados: formData.serviciosSeleccionados,
                estado: formData.estado,
                observaciones: formData.observaciones,
                descuento: parseFloat(formData.descuento) || 0,
                anticipo: parseFloat(formData.anticipo) || 0,
                costoTotal: costoTotal
            };

            const url = selectedReserva
                ? `http://localhost:3001/api/reservas/${selectedReserva.id}`
                : 'http://localhost:3001/api/reservas';

            const method = selectedReserva ? 'PUT' : 'POST';

            console.log('Enviando datos de reserva:', datosReserva);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosReserva)
            });

            if (response.ok) {
                const result = await response.json();
                console.log(selectedReserva ? 'Reserva actualizada:' : 'Reserva creada:', result);
                closeModal();

                if (selectedReserva) {
                    // Es una edición - mostrar cambios realizados
                    const changes = getChanges(selectedReserva, datosReserva);

                    if (changes.length > 0) {
                        await showAlert({
                            title: '¡Reserva Actualizada!',
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
                            text: 'No se detectaron cambios en la reserva',
                            icon: 'info',
                            confirmButtonText: 'Aceptar',
                            confirmButtonColor: '#17a2b8',
                            timer: 3000,
                            timerProgressBar: true
                        });
                    }
                } else {
                    // Es una creación
                    const cliente = clientes.find(c => c.id === parseInt(formData.clienteId));
                    const espacio = espacios.find(e => e.id === parseInt(formData.espacioId));
                    const serviciosSeleccionados = formData.serviciosSeleccionados.map(id =>
                        servicios.find(s => s.id === id)?.nombre || `ID:${id}`
                    );

                    await showAlert({
                        title: '¡Reserva Creada!',
                        html: `
                            <div style="text-align: left;">
                                <p><strong>Nueva reserva creada exitosamente:</strong></p>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Cliente: ${cliente?.nombre || 'No especificado'}</li>
                                    <li>Espacio: ${espacio?.nombre || 'No especificado'}</li>
                                    <li>Fecha: ${new Date(formData.fechaEvento).toLocaleDateString('es-CL')}</li>
                                    <li>Horario: ${formData.horaInicio} - ${formData.horaFin}</li>
                                    <li>Evento: ${formData.tipoEvento} (${formData.numeroPersonas} personas)</li>
                                    <li>Estado: ${estadosReserva.find(e => e.value === formData.estado)?.label}</li>
                                    <li>Costo Total: $${costoTotal.toLocaleString()}</li>
                                    ${serviciosSeleccionados.length > 0 ? `<li>Servicios: ${serviciosSeleccionados.join(', ')}</li>` : ''}
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

                await loadReservas();
            } else {
                const errorData = await response.json();
                console.error('Error al guardar reserva:', errorData.error);
                closeModal();
                await showAlert({
                    title: 'Error al guardar',
                    text: errorData.error || 'No se pudo guardar la reserva',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            }
        } catch (error) {
            console.error('Error al guardar reserva:', error);
            closeModal();
            await showAlert({
                title: 'Error de conexión',
                text: 'Error al guardar la reserva. Verifique su conexión.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setLoading(false);
        }
    };

    const eliminarReserva = async (id, clienteNombre, espacioNombre) => {
        const reserva = reservas.find(r => r.id === id);

        const result = await showAlert({
            title: '¿Eliminar reserva?',
            html: `
                <div style="text-align: left;">
                    <p>¿Estás seguro de que deseas eliminar la reserva de <strong>"${clienteNombre}"</strong> en <strong>"${espacioNombre}"</strong>?</p>
                    <div style="margin: 15px 0; padding: 10px; background-color: #fff3cd; border-radius: 4px; border-left: 4px solid #ffc107;">
                        <strong>⚠️ Esta acción no se puede deshacer</strong>
                        <ul style="margin: 8px 0; padding-left: 20px;">
                            <li>Se eliminará permanentemente la reserva</li>
                            <li>Se perderán todos los datos asociados</li>
                            ${reserva?.fechaEvento ? `<li>Fecha del evento: ${new Date(reserva.fechaEvento).toLocaleDateString('es-CL')}</li>` : ''}
                            ${reserva?.costoTotal ? `<li style="color: #dc3545;">Costo total: $${reserva.costoTotal.toLocaleString()}</li>` : ''}
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
                console.log('Eliminando reserva:', id);

                const response = await fetch(`http://localhost:3001/api/reservas/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Reserva eliminada correctamente:', result);

                    await showAlert({
                        title: '¡Reserva Eliminada!',
                        html: `
                            <div style="text-align: center;">
                                <p>La reserva de <strong>"${clienteNombre}"</strong> en <strong>"${espacioNombre}"</strong> ha sido eliminada exitosamente.</p>
                                <div style="margin-top: 15px; padding: 10px; background-color: #d4edda; border-radius: 4px;">
                                    <small>✅ Todos los datos asociados han sido removidos del sistema</small>
                                </div>
                            </div>
                        `,
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#28a745',
                        timer: 3000,
                        timerProgressBar: true
                    });

                    await loadReservas();
                } else {
                    const errorData = await response.json();
                    console.error('Error al eliminar reserva:', errorData.error);
                    await showAlert({
                        title: 'Error al eliminar',
                        text: errorData.error || 'No se pudo eliminar la reserva',
                        icon: 'error',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#dc3545'
                    });
                }
            } catch (error) {
                console.error('Error al eliminar reserva:', error);
                await showAlert({
                    title: 'Error de conexión',
                    text: 'Error al eliminar la reserva. Verifique su conexión.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const cambiarEstadoReserva = async (id, nuevoEstado) => {
        const reserva = reservas.find(r => r.id === id);
        const estadoActual = estadosReserva.find(e => e.value === reserva?.estado)?.label || reserva?.estado;
        const estadoNuevo = estadosReserva.find(e => e.value === nuevoEstado)?.label || nuevoEstado;

        const result = await showAlert({
            title: '¿Cambiar estado de reserva?',
            html: `
                <div style="text-align: left;">
                    <p>¿Deseas cambiar el estado de la reserva?</p>
                    <div style="margin: 15px 0; padding: 10px; background-color: #e7f3ff; border-radius: 4px;">
                        <p style="margin: 5px 0;"><strong>Cliente:</strong> ${reserva?.clienteNombre || 'No disponible'}</p>
                        <p style="margin: 5px 0;"><strong>Espacio:</strong> ${reserva?.espacioNombre || 'No disponible'}</p>
                        <p style="margin: 5px 0;"><strong>Estado actual:</strong> ${estadoActual}</p>
                        <p style="margin: 5px 0;"><strong>Nuevo estado:</strong> <span style="color: #28a745; font-weight: bold;">${estadoNuevo}</span></p>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                console.log('Cambiando estado de reserva:', id, 'a:', nuevoEstado);

                const response = await fetch(`http://localhost:3001/api/reservas/${id}/estado`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ estado: nuevoEstado })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Estado cambiado correctamente:', result);

                    await showAlert({
                        title: '¡Estado Actualizado!',
                        text: `La reserva ahora está "${estadoNuevo.toLowerCase()}"`,
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#28a745',
                        timer: 3000,
                        timerProgressBar: true
                    });

                    await loadReservas();
                } else {
                    const errorData = await response.json();
                    console.error('Error al cambiar estado:', errorData.error);
                    await showAlert({
                        title: 'Error al cambiar estado',
                        text: errorData.error || 'No se pudo cambiar el estado',
                        icon: 'error',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#dc3545'
                    });
                }
            } catch (error) {
                console.error('Error al cambiar estado:', error);
                await showAlert({
                    title: 'Error de conexión',
                    text: 'Error al cambiar el estado. Verifique su conexión.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#dc3545'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const openModal = (reserva = null) => {
        if (reserva) {
            setSelectedReserva(reserva);

            // Procesar la fecha correctamente
            let fechaFormateada = '';
            if (reserva.fechaEvento) {
                // Si ya viene en formato YYYY-MM-DD, usarla directamente
                if (typeof reserva.fechaEvento === 'string' && reserva.fechaEvento.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    fechaFormateada = reserva.fechaEvento;
                } else {
                    // Si viene como timestamp o fecha completa, convertirla
                    const fecha = new Date(reserva.fechaEvento);
                    if (!isNaN(fecha.getTime())) {
                        fechaFormateada = fecha.toISOString().split('T')[0];
                    }
                }
            }

            setFormData({
                clienteId: reserva.clienteId || '',
                espacioId: reserva.espacioId || '',
                fechaEvento: fechaFormateada,
                horaInicio: reserva.horaInicio || '',
                horaFin: reserva.horaFin || '',
                tipoEvento: reserva.tipoEvento || '',
                numeroPersonas: reserva.numeroPersonas || '',
                serviciosSeleccionados: reserva.serviciosSeleccionados || [],
                estado: reserva.estado || 'pendiente',
                observaciones: reserva.observaciones || '',
                descuento: reserva.descuento || 0,
                anticipo: reserva.anticipo || 0
            });
        } else {
            setSelectedReserva(null);
            setFormData({
                clienteId: '',
                espacioId: '',
                fechaEvento: '',
                horaInicio: '',
                horaFin: '',
                tipoEvento: '',
                numeroPersonas: '',
                serviciosSeleccionados: [],
                estado: 'pendiente',
                observaciones: '',
                descuento: 0,
                anticipo: 0
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReserva(null);
    };

    const filteredReservas = reservas.filter(reserva => {
        const matchesSearch = (reserva.clienteNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reserva.espacioNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (reserva.tipoEvento || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'todas' || reserva.estado === filterStatus;

        return matchesSearch && matchesStatus;
    });

    console.log('Total reservas:', reservas.length);
    console.log('Reservas filtradas:', filteredReservas.length);
    console.log('Término de búsqueda:', searchTerm);
    console.log('Filtro de estado:', filterStatus);

    return (
        <div className="section-container">
            <div className="section-header">
                <div className="header-content">
                    <h1>
                        <span className="section-icon">📅</span>
                        Gestión de Reservas
                    </h1>
                    <p>Administra todas las reservas del sistema</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => openModal()}
                    disabled={loading}
                >
                    <span>➕</span>
                    Nueva Reserva
                </button>
            </div>

            <div className="section-stats">
                <div className="stat-item">
                    <span className="stat-icon">📅</span>
                    <div>
                        <h3>{reservas.length}</h3>
                        <p>Total Reservas</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">⏳</span>
                    <div>
                        <h3>{reservas.filter(r => r.estado === 'pendiente').length}</h3>
                        <p>Pendientes</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">✅</span>
                    <div>
                        <h3>{reservas.filter(r => r.estado === 'confirmada').length}</h3>
                        <p>Confirmadas</p>
                    </div>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <div>
                        <h3>${reservas.reduce((sum, r) => sum + (r.costoTotal || 0), 0).toLocaleString()}</h3>
                        <p>Ingresos Totales</p>
                    </div>
                </div>
            </div>

            <div className="section-content">
                <div className="content-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, espacio o tipo de evento..."
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
                        <option value="todas">Todos los estados</option>
                        {estadosReserva.map(estado => (
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
                                <th>Cliente & Evento</th>
                                <th>Espacio</th>
                                <th>Fecha & Hora</th>
                                <th>Estado</th>
                                <th>Costo</th>
                                <th>Saldo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReservas.map(reserva => (
                                <tr key={reserva.id}>
                                    <td>
                                        <div>
                                            <strong>{reserva.clienteNombre || 'Cliente no disponible'}</strong>
                                            <br />
                                            <small>
                                                {reserva.tipoEvento || 'Tipo no especificado'} - {reserva.numeroPersonas || 0} personas
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{reserva.espacioNombre || 'Espacio no disponible'}</strong>
                                        <br />
                                        <small>
                                            {reserva.serviciosNombres && reserva.serviciosNombres.length > 0
                                                ? reserva.serviciosNombres.join(', ')
                                                : 'Sin servicios adicionales'
                                            }
                                        </small>
                                    </td>

                                    <td>
                                        <div>
                                            <strong>
                                                {reserva.fechaEvento ? (
                                                    (() => {
                                                        try {
                                                            // Si fechaEvento ya es una fecha válida en formato YYYY-MM-DD
                                                            if (typeof reserva.fechaEvento === 'string' && reserva.fechaEvento.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                                                const [year, month, day] = reserva.fechaEvento.split('-');
                                                                return `${day}/${month}/${year}`;
                                                            }
                                                            // Si es un timestamp o fecha completa
                                                            const fecha = new Date(reserva.fechaEvento);
                                                            if (!isNaN(fecha.getTime())) {
                                                                return fecha.toLocaleDateString('es-CL');
                                                            }
                                                            return 'Fecha inválida';
                                                        } catch (error) {
                                                            console.error('Error al formatear fecha:', error, reserva.fechaEvento);
                                                            return 'Fecha inválida';
                                                        }
                                                    })()
                                                ) : (
                                                    'Fecha no disponible'
                                                )}
                                            </strong>
                                            <br />
                                            <small>{reserva.horaInicio || '--:--'} - {reserva.horaFin || '--:--'}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${estadosReserva.find(e => e.value === reserva.estado)?.color || 'secondary'}`}>
                                            {estadosReserva.find(e => e.value === reserva.estado)?.label || reserva.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>${(reserva.costoTotal || 0).toLocaleString('es-CL')}</strong>
                                        <br />
                                        <small>Anticipo: ${(reserva.anticipo || 0).toLocaleString('es-CL')}</small>
                                    </td>
                                    <td>
                                        <strong className={(reserva.saldoPendiente || 0) > 0 ? 'text-danger' : 'text-success'}>
                                            ${(reserva.saldoPendiente || 0).toLocaleString('es-CL')}
                                        </strong>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-view"
                                                title="Ver detalles"
                                                disabled={loading}
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn-edit"
                                                onClick={() => openModal(reserva)}
                                                title="Editar"
                                                disabled={loading}
                                            >
                                                ✏️
                                            </button>
                                            {reserva.estado === 'pendiente' && (
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => cambiarEstadoReserva(reserva.id, 'confirmada')}
                                                    title="Confirmar reserva"
                                                    disabled={loading}
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            <button
                                                className="btn-delete"
                                                onClick={() => eliminarReserva(
                                                    reserva.id,
                                                    reserva.clienteNombre,
                                                    reserva.espacioNombre
                                                )}
                                                title="Eliminar reserva"
                                                disabled={loading}
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

                {filteredReservas.length === 0 && !loading && (
                    <div className="empty-state">
                        <h3>No se encontraron reservas</h3>
                        <p>
                            {searchTerm || filterStatus !== 'todas'
                                ? 'No hay reservas que coincidan con los filtros aplicados.'
                                : 'No hay reservas registradas en el sistema.'}
                        </p>
                        {!searchTerm && filterStatus === 'todas' && (
                            <button className="btn-primary" onClick={() => openModal()}>
                                Crear primera reserva
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
                            <h2>{selectedReserva ? 'Editar Reserva' : 'Nueva Reserva'}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Cliente</label>
                                        <select
                                            name="clienteId"
                                            value={formData.clienteId}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Seleccionar cliente</option>
                                            {clientes.map(cliente => (
                                                <option key={cliente.id} value={cliente.id}>
                                                    {cliente.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Espacio</label>
                                        <select
                                            name="espacioId"
                                            value={formData.espacioId}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Seleccionar espacio</option>
                                            {espacios.map(espacio => (
                                                <option key={espacio.id} value={espacio.id}>
                                                    {espacio.nombre} - ${(espacio.costo || espacio.costoBase || 0).toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Fecha del Evento</label>
                                        <input
                                            type="date"
                                            name="fechaEvento"
                                            value={formData.fechaEvento}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tipo de Evento</label>
                                        <select
                                            name="tipoEvento"
                                            value={formData.tipoEvento}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Seleccionar tipo</option>
                                            {tiposEvento.map(tipo => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Hora de Inicio</label>
                                        <input
                                            type="time"
                                            name="horaInicio"
                                            value={formData.horaInicio}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Hora de Fin</label>
                                        <input
                                            type="time"
                                            name="horaFin"
                                            value={formData.horaFin}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Número de Personas</label>
                                        <input
                                            type="number"
                                            name="numeroPersonas"
                                            value={formData.numeroPersonas}
                                            onChange={handleInputChange}
                                            required
                                            min="1"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado</label>
                                        <select
                                            name="estado"
                                            value={formData.estado}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        >
                                            {estadosReserva.map(estado => (
                                                <option key={estado.value} value={estado.value}>
                                                    {estado.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Servicios Adicionales</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {servicios.map(servicio => (
                                            <label key={servicio.id} className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.serviciosSeleccionados.includes(servicio.id)}
                                                    onChange={() => handleServicioChange(servicio.id)}
                                                    disabled={loading}
                                                />
                                                {servicio.nombre} - ${(servicio.precio || 0).toLocaleString()}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Descuento ($)</label>
                                        <input
                                            type="number"
                                            name="descuento"
                                            value={formData.descuento}
                                            onChange={handleInputChange}
                                            min="0"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Anticipo ($)</label>
                                        <input
                                            type="number"
                                            name="anticipo"
                                            value={formData.anticipo}
                                            onChange={handleInputChange}
                                            min="0"
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
                                        placeholder="Información adicional sobre la reserva..."
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <strong>Costo Total Estimado: ${calcularCostoTotal().toLocaleString()}</strong>
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
                                    {loading ? 'Guardando...' : (selectedReserva ? 'Actualizar' : 'Crear')} Reserva
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reservas;