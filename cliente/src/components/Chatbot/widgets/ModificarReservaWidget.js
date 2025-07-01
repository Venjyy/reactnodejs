import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Widgets.css';

const ModificarReservaWidget = (props) => {
  const [step, setStep] = useState('rut'); // 'rut', 'reservas', 'modificar'
  const [rut, setRut] = useState('');
  const [rutError, setRutError] = useState('');
  const [reservas, setReservas] = useState([]);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para validar RUT chileno
  const validarRUT = (rut) => {
    // Limpiar el RUT
    rut = rut.replace(/[^0-9kK]/g, '');
    
    if (rut.length < 8 || rut.length > 9) {
      return false;
    }

    const dv = rut.slice(-1).toLowerCase();
    const numero = rut.slice(0, -1);
    
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = numero.length - 1; i >= 0; i--) {
      suma += parseInt(numero[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvCalculado = 11 - (suma % 11);
    const dvFinal = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'k' : dvCalculado.toString();
    
    return dv === dvFinal;
  };

  // Función para formatear RUT
  const formatearRUT = (valor) => {
    // Remover todo lo que no sea número o K
    valor = valor.replace(/[^0-9kK]/g, '');
    
    // Limitar a 9 caracteres máximo
    if (valor.length > 9) {
      valor = valor.slice(0, 9);
    }
    
    // Si tiene más de 1 carácter, formatear
    if (valor.length > 1) {
      const numero = valor.slice(0, -1);
      const dv = valor.slice(-1);
      
      // Formatear el número con puntos
      let numeroFormateado = numero;
      if (numero.length > 3) {
        if (numero.length <= 6) {
          numeroFormateado = numero.slice(0, -3) + '.' + numero.slice(-3);
        } else {
          numeroFormateado = numero.slice(0, -6) + '.' + numero.slice(-6, -3) + '.' + numero.slice(-3);
        }
      }
      
      return numeroFormateado + '-' + dv;
    }
    
    return valor;
  };

  // Manejar cambio en el input de RUT
  const handleRutChange = (e) => {
    const valor = e.target.value;
    const rutFormateado = formatearRUT(valor);
    setRut(rutFormateado);
    
    // Validar solo si tiene la longitud mínima
    if (rutFormateado.length >= 11) { // 12.345.678-9 = 11 caracteres
      const rutLimpio = rutFormateado.replace(/[^0-9kK]/g, '');
      if (validarRUT(rutLimpio)) {
        setRutError('');
      } else {
        setRutError('RUT inválido');
      }
    } else {
      setRutError('');
    }
  };

  const buscarReservas = async () => {
    if (!rut.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'RUT requerido',
        text: 'Por favor ingresa tu RUT',
        confirmButtonColor: '#8B4CF7'
      });
      return;
    }

    // Validar RUT antes de buscar
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    if (!validarRUT(rutLimpio)) {
      Swal.fire({
        icon: 'error',
        title: 'RUT inválido',
        text: 'Por favor verifica que el RUT esté correcto',
        confirmButtonColor: '#8B4CF7'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/reservas/cliente/${rut}`);
      
      if (response.data.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin reservas',
          text: 'No encontré reservas activas con ese RUT.',
          confirmButtonColor: '#8B4CF7'
        });
        setStep('rut');
      } else {
        setReservas(response.data);
        setStep('reservas');
        
        Swal.fire({
          icon: 'success',
          title: '¡Reservas encontradas!',
          text: `Se encontraron ${response.data.length} reserva(s) activa(s)`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al buscar reservas',
        text: 'Hubo un problema al buscar tus reservas. Intenta más tarde.',
        confirmButtonColor: '#8B4CF7'
      });
    } finally {
      setLoading(false);
    }
  };

  const seleccionarReserva = (reserva) => {
    setSelectedReserva(reserva);
    setStep('modificar');
  };

  const modificarReserva = async () => {
    if (!nuevaFecha || !nuevaHora) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa la nueva fecha y hora',
        confirmButtonColor: '#8B4CF7'
      });
      return;
    }

    // Confirmar la modificación
    const result = await Swal.fire({
      title: '¿Confirmar modificación?',
      html: `
        <p><strong>Reserva:</strong> ${selectedReserva.espacio_nombre}</p>
        <p><strong>Nueva fecha:</strong> ${new Date(nuevaFecha).toLocaleDateString('es-CL')}</p>
        <p><strong>Nueva hora:</strong> ${nuevaHora}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#8B4CF7',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, modificar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:3001/api/reservas/${selectedReserva.id}/fecha-hora`, {
        fecha_reserva: nuevaFecha,
        hora_inicio: nuevaHora
      });

      if (response.data.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Reserva modificada!',
          text: 'Tu reserva ha sido modificada exitosamente. Te enviaremos una confirmación por correo.',
          confirmButtonColor: '#8B4CF7'
        });
        
        const successMessage = props.actionProvider.createChatBotMessage('¡Reserva modificada exitosamente! Te enviaremos una confirmación por correo.');
        props.actionProvider.setState((prev) => ({
          ...prev,
          messages: [...prev.messages, successMessage],
        }));
        
        setStep('rut');
        setRut('');
        setReservas([]);
        setSelectedReserva(null);
        setNuevaFecha('');
        setNuevaHora('');
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMsg = 'Error al modificar la reserva.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error al modificar',
        text: errorMsg,
        confirmButtonColor: '#8B4CF7'
      });
    } finally {
      setLoading(false);
    }
  };

  const volver = () => {
    props.actionProvider.handleBackToMenu();
  };

  if (step === 'rut') {
    return (
      <div className="widget-container">
        <div className="input-group">
          <label>Ingresa tu RUT:</label>
          <input
            type="text"
            value={rut}
            onChange={handleRutChange}
            placeholder="12.345.678-9"
            className={`widget-input ${rutError ? 'error' : ''}`}
            maxLength="12"
          />
          {rutError && <span className="error-message">{rutError}</span>}
          <button 
            onClick={buscarReservas} 
            disabled={loading || rutError}
            className="widget-button primary"
          >
            {loading ? 'Buscando...' : 'Buscar Reservas'}
          </button>
          <button onClick={volver} className="widget-button secondary">
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  if (step === 'reservas') {
    return (
      <div className="widget-container">
        <h4>Tus Reservas Activas:</h4>
        {reservas.map((reserva, index) => (
          <div key={reserva.id} className="reserva-item">
            <div className="reserva-info">
              <strong>Reserva #{index + 1}</strong>
              <p>Fecha: {new Date(reserva.fecha_reserva).toLocaleDateString('es-CL')}</p>
              <p>Espacio: {reserva.espacio_nombre}</p>
              <p>Personas: {reserva.numero_personas}</p>
            </div>
            <button 
              onClick={() => seleccionarReserva(reserva)}
              className="widget-button primary small"
            >
              Modificar
            </button>
          </div>
        ))}
        <button onClick={() => setStep('rut')} className="widget-button secondary">
          Volver
        </button>
      </div>
    );
  }

  if (step === 'modificar') {
    return (
      <div className="widget-container">
        <h4>Modificar Reserva</h4>
        <div className="input-group">
          <label>Nueva Fecha:</label>
          <input
            type="date"
            value={nuevaFecha}
            onChange={(e) => setNuevaFecha(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="widget-input"
          />
          
          <label>Nueva Hora:</label>
          <select
            value={nuevaHora}
            onChange={(e) => setNuevaHora(e.target.value)}
            className="widget-input"
          >
            <option value="">Selecciona una hora</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="12:00">12:00</option>
            <option value="13:00">13:00</option>
            <option value="14:00">14:00</option>
            <option value="15:00">15:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
            <option value="18:00">18:00</option>
            <option value="19:00">19:00</option>
            <option value="20:00">20:00</option>
          </select>
          
          <button 
            onClick={modificarReserva} 
            disabled={loading}
            className="widget-button primary"
          >
            {loading ? 'Modificando...' : 'Confirmar Modificación'}
          </button>
          <button onClick={() => setStep('reservas')} className="widget-button secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default ModificarReservaWidget;
