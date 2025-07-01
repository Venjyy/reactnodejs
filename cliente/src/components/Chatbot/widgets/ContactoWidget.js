import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './Widgets.css';

const ContactoWidget = (props) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    mensaje: ''
  });
  const [enviado, setEnviado] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefono') {
      // Formatear número de teléfono chileno
      const formattedPhone = formatPhoneNumber(value);
      setFormData({
        ...formData,
        [name]: formattedPhone
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Función para formatear número de teléfono chileno
  const formatPhoneNumber = (value) => {
    // Remover todos los caracteres que no sean números
    const numbers = value.replace(/\D/g, '');
    
    // Si está vacío, retornar vacío
    if (numbers.length === 0) return '';
    
    // Si empieza con 56, removerlo para evitar duplicados
    let cleanNumbers = numbers;
    if (numbers.startsWith('56') && numbers.length > 2) {
      cleanNumbers = numbers.substring(2);
    }
    
    // Si no empieza con 9, agregar 9 al principio (para números chilenos móviles)
    if (cleanNumbers.length > 0 && !cleanNumbers.startsWith('9')) {
      cleanNumbers = '9' + cleanNumbers;
    }
    
    // Limitar a 9 dígitos máximo (números chilenos móviles: 9 + 8 dígitos)
    cleanNumbers = cleanNumbers.substring(0, 9);
    
    // Formatear según la longitud
    if (cleanNumbers.length === 0) {
      return '';
    } else if (cleanNumbers.length === 1) {
      return `+569`;
    } else if (cleanNumbers.length <= 5) {
      // Formato: +569 1234
      return `+569 ${cleanNumbers.substring(1)}`;
    } else if (cleanNumbers.length <= 9) {
      // Formato final: +569 1234 5678
      const part1 = cleanNumbers.substring(1, 5); // 4 dígitos
      const part2 = cleanNumbers.substring(5, 9); // 4 dígitos
      
      if (part2.length === 0) {
        return `+569 ${part1}`;
      } else {
        return `+569 ${part1} ${part2}`;
      }
    }
    
    return cleanNumbers;
  };

  const enviarMensaje = async () => {
    if (!formData.nombre || !formData.telefono || !formData.correo) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ Campos Incompletos',
        text: 'Por favor completa todos los campos obligatorios',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#8B4CF7'
      });
      return;
    }

    // Validación básica de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      Swal.fire({
        icon: 'error',
        title: '📧 Correo Inválido',
        text: 'Por favor ingresa un correo electrónico válido',
        confirmButtonText: 'Corregir',
        confirmButtonColor: '#8B4CF7'
      });
      return;
    }

    // Validación de teléfono chileno
    // El formato esperado es: +569 1234 5678 (13 caracteres total)
    // Verificar que tenga exactamente 8 dígitos después de +569
    const phoneNumbers = formData.telefono.replace(/\D/g, ''); // Solo números
    const phoneWithoutCountryCode = phoneNumbers.startsWith('56') ? phoneNumbers.substring(2) : phoneNumbers;
    
    if (phoneWithoutCountryCode.length !== 9 || !phoneWithoutCountryCode.startsWith('9')) {
      Swal.fire({
        icon: 'error',
        title: '📱 Teléfono Inválido',
        text: 'Por favor ingresa un número de teléfono chileno válido (8 dígitos después del +569)',
        confirmButtonText: 'Corregir',
        confirmButtonColor: '#8B4CF7'
      });
      return;
    }

    // Mostrar loading
    Swal.fire({
      title: '📤 Enviando mensaje...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch('http://localhost:3001/api/contacto-chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Mensaje de contacto enviado exitosamente');
        
        Swal.fire({
          icon: 'success',
          title: '✅ ¡Mensaje Enviado!',
          html: `
            <p>Tu información ha sido enviada correctamente.</p>
            <p><strong>📧 Se ha notificado al administrador</strong></p>
            <p>Nos contactaremos contigo en la brevedad posible.</p>
            <hr style="margin: 15px 0;">
            <small style="color: #6b7280;">
              <em>💼 Horario de respuesta: Lun-Dom 10:00-22:00</em>
            </small>
          `,
          confirmButtonText: 'Perfecto',
          confirmButtonColor: '#10b981',
          timer: 4000,
          timerProgressBar: true
        });
        
        setEnviado(true);
        setTimeout(() => {
          setShowForm(false);
          setEnviado(false);
          setFormData({ nombre: '', telefono: '', correo: '', mensaje: '' });
        }, 4000);
      } else {
        throw new Error(data.error || 'Error al enviar mensaje');
      }
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      Swal.fire({
        icon: 'error',
        title: '❌ Error al Enviar',
        html: `
          <p>No pudimos enviar tu mensaje en este momento.</p>
          <p>Por favor intenta más tarde o contacta directamente:</p>
          <hr style="margin: 15px 0;">
          <p><strong>📞 +569 1234 5678</strong></p>
          <p><strong>📧 contacto@eventoscanete.cl</strong></p>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const volver = () => {
    props.actionProvider.handleBackToMenu();
  };

  if (enviado) {
    return (
      <div className="widget-container">
        <div className="success-message">
          <h4>✅ ¡Mensaje enviado!</h4>
          <p>Tu información ha sido enviada correctamente.</p>
          <p><strong>📧 Se ha notificado al administrador</strong></p>
          <p>Nos contactaremos contigo en la brevedad posible.</p>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
            <em>💼 Horario de respuesta: Lun-Dom 10:00-22:00</em>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="widget-container">
        <h4>Contacto Directo</h4>
        <div className="contact-form">
          <div className="input-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className="widget-input"
              placeholder="Tu nombre completo"
            />
          </div>
          
          <div className="input-group">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              className="widget-input"
              placeholder="Ingresa tu número (ej: 91234567)"
              maxLength="15"
            />
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              <em>Formato automático: +569 1234 5678</em>
            </div>
          </div>
          
          <div className="input-group">
            <label>Correo *</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleInputChange}
              className="widget-input"
              placeholder="tu@correo.com"
            />
          </div>
          
          <div className="input-group">
            <label>Mensaje (opcional)</label>
            <textarea
              name="mensaje"
              value={formData.mensaje}
              onChange={handleInputChange}
              className="widget-textarea"
              placeholder="Cuéntanos en qué podemos ayudarte..."
              rows="3"
            />
          </div>
          
          <button onClick={enviarMensaje} className="widget-button primary">
            Enviar Mensaje
          </button>
          <button onClick={() => setShowForm(false)} className="widget-button secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      <h4>Información de Contacto</h4>
      
      <div className="contact-info">
        <div className="contact-item">
          <span className="contact-icon">📞</span>
          <div>
            <strong>Teléfono</strong>
            <p>+56 9 1234 5678</p>
          </div>
        </div>
        
        <div className="contact-item">
          <span className="contact-icon">📧</span>
          <div>
            <strong>Email</strong>
            <p>contacto@eventoscanete.cl</p>
          </div>
        </div>
        
        <div className="contact-item">
          <span className="contact-icon">📍</span>
          <div>
            <strong>Dirección</strong>
            <p>Cañete, Región del Biobío</p>
          </div>
        </div>
        
        <div className="contact-item">
          <span className="contact-icon">🕒</span>
          <div>
            <strong>Horarios</strong>
            <p>Lun - Dom: 10:00 - 22:00</p>
          </div>
        </div>
      </div>
      
      <div className="contact-actions">
        <button onClick={() => setShowForm(true)} className="widget-button primary">
          Enviar Mensaje Directo
        </button>
        <button onClick={volver} className="widget-button secondary">
          Volver al Menú
        </button>
      </div>
      
      <div className="contact-note">
        <p><em>💬 Nuestro administrador también se contactará contigo en la brevedad para coordinar los detalles de tu evento.</em></p>
      </div>
    </div>
  );
};

export default ContactoWidget;
