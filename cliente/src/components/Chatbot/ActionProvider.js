import { createChatBotMessage } from 'react-chatbot-kit';
import axios from 'axios';

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  // Función helper para auto-scroll
  scrollToBottom = () => {
    setTimeout(() => {
      const chatContainer = document.querySelector('.react-chatbot-kit-chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  };

  // Función helper para agregar mensaje y hacer scroll
  addMessageAndScroll = (message) => {
    this.setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
    this.scrollToBottom();
  };

  // Manejar opción de modificar reserva
  handleModificarReserva = () => {
    const message = this.createChatBotMessage(
      'Para modificar tu reserva, necesito que ingreses tu RUT. Por favor escríbelo en el formato: 12.345.678-9',
      {
        widget: 'modificarReserva',
      }
    );
    this.addMessageAndScroll(message);
  };

  // Manejar entrada de RUT
  handleRutInput = async (rut) => {
    const loadingMessage = this.createChatBotMessage('Buscando tus reservas activas...');
    this.addMessageAndScroll(loadingMessage);

    try {
      // Limpiar el RUT para la consulta
      const rutLimpio = rut.replace(/[^0-9kK-]/g, '');
      const response = await axios.get(`http://localhost:3001/api/reservas/cliente/${rutLimpio}`);
      
      if (response.data.length === 0) {
        const noReservasMessage = this.createChatBotMessage(
          'No encontré reservas activas con ese RUT. ¿Estás seguro de que el RUT es correcto?'
        );
        this.addMessageAndScroll(noReservasMessage);
      } else {
        let reservasText = 'Estas son tus reservas activas:\n\n';
        response.data.forEach((reserva, index) => {
          reservasText += `${index + 1}. Fecha: ${new Date(reserva.fecha_reserva).toLocaleDateString('es-CL')}\n`;
          reservasText += `   Espacio: ${reserva.espacio_nombre}\n`;
          reservasText += `   Personas: ${reserva.numero_personas}\n\n`;
        });
        
        reservasText += 'Puedes usar el widget de abajo para modificar una reserva.';
        
        const reservasMessage = this.createChatBotMessage(reservasText, {
          widget: 'modificarReserva'
        });
        this.setState((prev) => ({
          ...prev,
          messages: [...prev.messages, reservasMessage],
          reservasActuales: response.data,
        }));
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Error al buscar reservas:', error);
      let errorMsg = 'Hubo un error al buscar tus reservas.';
      if (error.response && error.response.status === 500) {
        errorMsg += ' Por favor verifica que el RUT esté correcto.';
      } else {
        errorMsg += ' Por favor intenta más tarde.';
      }
      
      const errorMessage = this.createChatBotMessage(errorMsg + ' También puedes contactar directamente con nosotros.');
      this.addMessageAndScroll(errorMessage);
    }
  };

  // Manejar FAQ
  handleFAQ = () => {
    const message = this.createChatBotMessage(
      'Aquí tienes las preguntas más frecuentes:', 
      {
        widget: 'faq',
      }
    );
    this.addMessageAndScroll(message);
  };

  // Manejar contacto
  handleContacto = () => {
    const message = this.createChatBotMessage(
      'Aquí tienes nuestros datos de contacto:', 
      {
        widget: 'contacto',
      }
    );
    this.addMessageAndScroll(message);
  };

  // Volver al menú principal
  handleBackToMenu = () => {
    const message = this.createChatBotMessage(
      '¿En qué más puedo ayudarte?',
      {
        widget: 'initialOptions',
      }
    );
    this.addMessageAndScroll(message);
  };

  // Respuesta por defecto
  handleDefault = () => {
    const message = this.createChatBotMessage(
      'No entendí tu mensaje. ¿Podrías elegir una de las opciones del menú?',
      {
        widget: 'initialOptions',
      }
    );
    this.addMessageAndScroll(message);
  };
}

export default ActionProvider;
