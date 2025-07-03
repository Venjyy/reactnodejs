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

  // Helper para mostrar mensaje de ayuda antes de opciones
  addMessageWithHelpText = (messageText) => {
    const helpMessage = this.createChatBotMessage(
      'Si necesitas ayuda rápida selecciona alguna de estas 3 opciones 👇'
    );
    this.addMessageAndScroll(helpMessage);

    setTimeout(() => {
      const mainMessage = this.createChatBotMessage(messageText, {
        widget: 'initialOptions',
      });
      this.addMessageAndScroll(mainMessage);
    }, 500);
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
    this.addMessageWithHelpText('¿En qué más puedo ayudarte?');
  };

  // Manejar saludos
  handleSaludo = () => {
    const saludos = [
      '¡Hola! Bienvenido a El Patio de Lea 😊',
      '¡Buenas! ¿En qué puedo ayudarte hoy?',
      'Hola, ¡qué gusto tenerte aquí! ¿Cómo puedo asistirte?',
      '¡Hola! Soy Venjy, tu asistente virtual. ¡Estoy aquí para ayudarte!'
    ];
    const saludoAleatorio = saludos[Math.floor(Math.random() * saludos.length)];

    this.addMessageWithHelpText(saludoAleatorio);
  };

  // Manejar despedidas
  handleDespedida = () => {
    const despedidas = [
      '¡Hasta luego! Espero haberte ayudado 😊',
      '¡Que tengas un excelente día! Vuelve cuando necesites algo',
      '¡Nos vemos! No dudes en escribirme si tienes más preguntas',
      '¡Chao! Fue un placer ayudarte. ¡Te esperamos en El Patio de Lea!'
    ];
    const despedidaAleatoria = despedidas[Math.floor(Math.random() * despedidas.length)];

    const message = this.createChatBotMessage(despedidaAleatoria);
    this.addMessageAndScroll(message);
  };

  // Manejar consultas sobre horarios
  handleHorarios = () => {
    const message = this.createChatBotMessage(
      'Nuestros horarios de atención son:\n\n📅 Lunes a Domingo: 9:00 AM - 10:00 PM\n\n¡Te esperamos! ¿Te gustaría hacer una reserva?',
      {
        widget: 'initialOptions',
      }
    );
    this.addMessageAndScroll(message);
  };

  // Manejar consultas sobre precios
  handlePrecios = () => {
    const message = this.createChatBotMessage(
      'Los precios varían según el espacio y la duración de tu reserva 💰\n\nTenemos opciones para todos los presupuestos. Para conocer los precios específicos, puedes:\n\n• Contactarnos directamente\n• Hacer una consulta personalizada\n\n¿Te gustaría ver nuestros datos de contacto?',
      {
        widget: 'initialOptions',
      }
    );
    this.addMessageAndScroll(message);
  };

  // Manejar consultas sobre servicios - USANDO DATOS REALES
  handleServicios = async () => {
    const loadingMessage = this.createChatBotMessage('Consultando nuestros espacios disponibles...');
    this.addMessageAndScroll(loadingMessage);

    try {
      // Obtener espacios reales de la base de datos
      const response = await axios.post('http://localhost:3001/api/chatbot/consultar-disponibilidad', {});

      if (response.data.espacios && response.data.espacios.length > 0) {
        let espaciosTexto = 'En El Patio de Lea ofrecemos estos espacios para tus eventos:\n\n';

        response.data.espacios.forEach((espacio, index) => {
          const emoji = this.getEmojiEspacio(espacio.nombre);
          espaciosTexto += `${emoji} **${espacio.nombre}**\n`;
          espaciosTexto += `   👥 Capacidad: ${espacio.capacidad} personas\n`;
          espaciosTexto += `   💰 Desde: $${espacio.costo_base.toLocaleString('es-CL')}\n`;
          espaciosTexto += `   📝 ${espacio.descripcion}\n\n`;
        });

        espaciosTexto += '¿Te interesa consultar disponibilidad para algún espacio específico? 😊';

        const message = this.createChatBotMessage(espaciosTexto, {
          widget: 'initialOptions',
        });
        this.addMessageAndScroll(message);
      } else {
        const errorMessage = this.createChatBotMessage(
          'No pude obtener la información de espacios en este momento. Por favor intenta más tarde o contáctanos directamente.',
          { widget: 'contacto' }
        );
        this.addMessageAndScroll(errorMessage);
      }
    } catch (error) {
      console.error('Error al obtener espacios:', error);
      const errorMessage = this.createChatBotMessage(
        'Hubo un error al consultar nuestros espacios. Por favor intenta más tarde o contáctanos directamente.',
        { widget: 'contacto' }
      );
      this.addMessageAndScroll(errorMessage);
    }
  };

  // Helper para obtener emoji según el tipo de espacio
  getEmojiEspacio = (nombreEspacio) => {
    const nombre = nombreEspacio.toLowerCase();
    if (nombre.includes('salon') || nombre.includes('cristal')) return '🏰';
    if (nombre.includes('terraza') || nombre.includes('campestre')) return '🌿';
    if (nombre.includes('quincho') || nombre.includes('tradicional')) return '🍖';
    if (nombre.includes('sala') || nombre.includes('intima')) return '🏠';
    if (nombre.includes('gran') || nombre.includes('eventos')) return '🎪';
    return '🏡';
  };

  // Manejar consultas sobre ubicación
  handleUbicacion = () => {
    const message = this.createChatBotMessage(
      '📍 Nos ubicamos en una zona privilegiada y de fácil acceso.\n\nPara obtener nuestra dirección exacta y cómo llegar, puedes contactarnos directamente. ¡Te daremos todas las indicaciones!',
      {
        widget: 'contacto',
      }
    );
    this.addMessageAndScroll(message);
  };

  // Respuesta personalizada más inteligente
  handlePersonalizedResponse = (userMessage) => {
    // Si el mensaje es muy corto, dar una respuesta más general
    if (userMessage.length < 10) {
      const helpMessage = this.createChatBotMessage(
        'Si necesitas ayuda rápida selecciona alguna de estas 3 opciones 👇'
      );
      this.addMessageAndScroll(helpMessage);

      setTimeout(() => {
        const respuestaCorta = this.createChatBotMessage(
          'Entiendo. ¿En qué puedo ayudarte específicamente?',
          {
            widget: 'initialOptions',
          }
        );
        this.addMessageAndScroll(respuestaCorta);
      }, 500);
      return;
    }

    // Para mensajes más largos, dar sugerencia de formato
    const sugerenciaFormato = this.createChatBotMessage(
      '❌ No logré entender tu consulta. ¿Podrías explicármelo de esta manera?\n\n📝 **Ejemplos de formato:**\n\n• Para horarios: "¿Cuál es el horario de atención?"\n• Para disponibilidad: "Consultar disponibilidad para fecha 15 de julio en Salón de Cristal con 10 personas"\n• Para precios: "¿Cuánto cuesta el salón?"\n• Para servicios: "¿Qué espacios tienen disponibles?"'
    );
    this.addMessageAndScroll(sugerenciaFormato);

    setTimeout(() => {
      const helpMessage = this.createChatBotMessage(
        'Si necesitas ayuda rápida selecciona alguna de estas 3 opciones 👇'
      );
      this.addMessageAndScroll(helpMessage);

      setTimeout(() => {
        const menuMessage = this.createChatBotMessage(
          '¿En qué más puedo ayudarte?',
          {
            widget: 'initialOptions',
          }
        );
        this.addMessageAndScroll(menuMessage);
      }, 500);
    }, 2000);
  };

  // Respuesta por defecto mejorada
  handleDefault = () => {
    const helpMessage = this.createChatBotMessage(
      'Si necesitas ayuda rápida selecciona alguna de estas 3 opciones 👇'
    );
    this.addMessageAndScroll(helpMessage);

    setTimeout(() => {
      const message = this.createChatBotMessage(
        'No entendí tu mensaje. ¿Podrías elegir una de las opciones del menú?',
        {
          widget: 'initialOptions',
        }
      );
      this.addMessageAndScroll(message);
    }, 500);
  };

  // Manejar respuestas combinadas (saludo + información específica)
  handleRespuestaCombinada = (intencionPrincipal, incluyeSaludo) => {
    let respuesta = '';
    let widget = 'initialOptions';

    if (incluyeSaludo) {
      respuesta = '¡Hola! Qué gusto tenerte aquí 😊\n\n';
    }

    switch (intencionPrincipal) {
      case 'horarios':
        respuesta += 'Te cuento sobre nuestros horarios:\n\n📅 Lunes a Domingo: 9:00 AM - 10:00 PM\n\n¡Te esperamos! ¿Te gustaría hacer una reserva?';
        break;
      case 'precios':
        respuesta += 'Sobre los precios 💰\n\nLos costos varían según el espacio y duración. Tenemos opciones para todos los presupuestos. ¿Te gustaría que te contactemos para darte información específica?';
        widget = 'contacto';
        break;
      case 'servicios':
        respuesta += 'Te muestro nuestros espacios disponibles:\n\n🏡 Salón Interior\n🍖 Quincho con parrilla\n⚽ Cancha de fútbol\n🌿 Espacios al aire libre\n\n¿Te interesa alguno en particular?';
        break;
      case 'ubicacion':
        respuesta += 'Sobre nuestra ubicación 📍\n\nEstamos en una zona privilegiada y de fácil acceso. Te puedo dar la dirección exacta y cómo llegar.';
        widget = 'contacto';
        break;
      case 'reserva':
        respuesta += 'Perfecto, te ayudo con tu reserva 📅\n\nPuedes hacer tu reserva directamente desde nuestra página principal o puedo darte información específica. ¿Qué prefieres?';
        break;
      case 'disponibilidad':
        respuesta += 'Para consultar disponibilidad 📅\n\nPuedo ayudarte a verificar qué fechas están libres. ¿Para qué fecha y espacio necesitas la información?';
        break;
      default:
        respuesta += '¿En qué puedo ayudarte específicamente?';
    }

    const message = this.createChatBotMessage(respuesta, { widget });
    this.addMessageAndScroll(message);
  };

  // Manejar información sobre reservas
  handleReservaInfo = () => {
    const message = this.createChatBotMessage(
      '¡Perfecto! Te ayudo con tu reserva 📅\n\nPuedes:\n• Hacer una reserva nueva desde nuestra página principal\n• Consultar disponibilidad para fechas específicas\n• Modificar una reserva existente\n\n¿Qué necesitas hacer?',
      {
        widget: 'initialOptions',
      }
    );
    this.addMessageAndScroll(message);
  };

  // Manejar consultas sobre disponibilidad
  handleDisponibilidad = () => {
    const message = this.createChatBotMessage(
      'Para consultar disponibilidad 📅\n\nNecesito que me indiques:\n• ¿Para qué fecha?\n• ¿Qué espacio te interesa?\n• ¿Para cuántas personas?\n\nCon esa información puedo ayudarte mejor. También puedes contactarnos directamente.',
      {
        widget: 'contacto',
      }
    );
    this.addMessageAndScroll(message);
  };

  // NUEVO: Manejar consultas específicas de disponibilidad con datos extraídos
  handleConsultaDisponibilidadEspecifica = async (datosConsulta) => {
    const { fecha, espacio, personas } = datosConsulta;

    // Crear mensaje de carga
    const loadingMessage = this.createChatBotMessage('🔍 Consultando disponibilidad...');
    this.addMessageAndScroll(loadingMessage);

    try {
      // Preparar parámetros para la consulta
      const params = new URLSearchParams();

      if (fecha) {
        // Convertir fecha a formato compatible
        const fechaFormateada = this.formatearFechaParaConsulta(fecha);
        if (fechaFormateada) {
          params.append('fecha', fechaFormateada);
        } else {
          // Si no se puede formatear la fecha, pedir clarificación
          const errorMessage = this.createChatBotMessage(
            `No pude entender la fecha "${fecha}". Por favor, especifica la fecha en formato:\n\n• "5 de julio" \n• "05/07/2025"\n• "mañana"\n• "sábado"`
          );
          this.addMessageAndScroll(errorMessage);
          return;
        }
      }

      if (espacio) params.append('espacio', espacio);
      if (personas) params.append('personas', personas.toString());

      // Realizar consulta al servidor
      const response = await fetch(`http://localhost:3001/api/consultar-disponibilidad?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al consultar disponibilidad');
      }

      // Crear respuesta basada en los resultados
      let mensajeRespuesta = data.mensaje + '\n\n';

      if (data.disponible !== undefined) {
        // Respuesta para espacio específico
        if (data.disponible) {
          mensajeRespuesta += `📅 Fecha: ${data.fecha}\n`;
          mensajeRespuesta += `🏠 Espacio: ${data.espacio}\n`;
          if (data.personas !== 'No especificado') {
            mensajeRespuesta += `👥 Para ${data.personas} personas\n\n`;
          }
          mensajeRespuesta += '¿Te gustaría hacer la reserva ahora?';
        } else {
          mensajeRespuesta += `📅 Fecha solicitada: ${data.fecha}\n`;
          mensajeRespuesta += `🏠 Espacio: ${data.espacio}\n\n`;
          mensajeRespuesta += '¿Te gustaría consultar otros espacios o fechas disponibles?';
        }
      } else {
        // Respuesta para consulta general
        if (data.espaciosDisponibles && data.espaciosDisponibles.length > 0) {
          mensajeRespuesta += 'Espacios disponibles:\n';
          data.espaciosDisponibles.forEach((espacio, index) => {
            mensajeRespuesta += `${index + 1}. ${espacio.nombre}\n`;
          });
          mensajeRespuesta += '\n¿Te interesa alguno en particular?';
        }

        if (data.espaciosOcupados && data.espaciosOcupados.length > 0) {
          mensajeRespuesta += '\n\nEspacios no disponibles:\n';
          data.espaciosOcupados.forEach((espacio, index) => {
            mensajeRespuesta += `• ${espacio.nombre}\n`;
          });
        }
      }

      const responseMessage = this.createChatBotMessage(mensajeRespuesta, {
        widget: data.disponible ? 'contacto' : 'initialOptions'
      });
      this.addMessageAndScroll(responseMessage);

    } catch (error) {
      console.error('Error al consultar disponibilidad:', error);

      let errorMsg = 'No pude consultar la disponibilidad en este momento. ';

      if (error.message.includes('espacio')) {
        errorMsg += 'Verifica que el nombre del espacio sea correcto. ';
      }

      errorMsg += 'Puedes contactarnos directamente para obtener esta información.';

      const errorMessage = this.createChatBotMessage(errorMsg, {
        widget: 'contacto'
      });
      this.addMessageAndScroll(errorMessage);
    }
  };

  // Helper para formatear fechas para la consulta
  formatearFechaParaConsulta = (fechaTexto) => {
    const hoy = new Date();
    const fechaTextoLower = fechaTexto.toLowerCase();

    // Casos especiales
    if (fechaTextoLower.includes('hoy')) {
      return hoy.toISOString().split('T')[0];
    }

    if (fechaTextoLower.includes('mañana')) {
      const mañana = new Date(hoy);
      mañana.setDate(hoy.getDate() + 1);
      return mañana.toISOString().split('T')[0];
    }

    // Días de la semana
    const diasSemana = {
      'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3,
      'jueves': 4, 'viernes': 5, 'sabado': 6, 'sábado': 6, 'domingo': 0
    };

    for (const [dia, diaNum] of Object.entries(diasSemana)) {
      if (fechaTextoLower.includes(dia)) {
        const proximoDia = new Date(hoy);
        const diasHastaProximoDia = (diaNum - hoy.getDay() + 7) % 7;
        proximoDia.setDate(hoy.getDate() + (diasHastaProximoDia || 7));
        return proximoDia.toISOString().split('T')[0];
      }
    }

    // Formato "X de mes"
    const meses = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
      'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };

    const matchMes = fechaTexto.match(/(\d{1,2})\s*de\s*(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
    if (matchMes) {
      const dia = parseInt(matchMes[1]);
      const mes = meses[matchMes[2].toLowerCase()];
      const año = hoy.getFullYear();

      const fecha = new Date(año, mes, dia);

      // Si la fecha ya pasó este año, usar el próximo año
      if (fecha < hoy) {
        fecha.setFullYear(año + 1);
      }

      return fecha.toISOString().split('T')[0];
    }

    // Formato DD/MM/YYYY o DD/MM
    const matchNumerico = fechaTexto.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
    if (matchNumerico) {
      const dia = parseInt(matchNumerico[1]);
      const mes = parseInt(matchNumerico[2]) - 1; // Los meses en JS van de 0-11
      const año = matchNumerico[3] ? parseInt(matchNumerico[3]) : hoy.getFullYear();

      const fecha = new Date(año, mes, dia);

      // Si la fecha ya pasó este año y no se especificó año, usar el próximo año
      if (fecha < hoy && !matchNumerico[3]) {
        fecha.setFullYear(año + 1);
      }

      return fecha.toISOString().split('T')[0];
    }

    return null;
  };

  // Manejar consultas específicas de disponibilidad con datos reales
  handleConsultaDisponibilidadEspecifica = async (datosConsulta) => {
    const { fecha, espacio, personas } = datosConsulta;

    let mensajeCarga = 'Consultando disponibilidad';
    if (fecha) mensajeCarga += ` para ${fecha}`;
    if (espacio) mensajeCarga += ` en ${espacio}`;
    if (personas) mensajeCarga += ` para ${personas} personas`;
    mensajeCarga += '...';

    const loadingMessage = this.createChatBotMessage(mensajeCarga);
    this.addMessageAndScroll(loadingMessage);

    try {
      // Preparar datos para la consulta
      const consultaData = {};

      if (fecha) {
        // Intentar parsear la fecha en diferentes formatos
        const fechaParseada = this.parsearFecha(fecha);
        if (fechaParseada) {
          consultaData.fecha = fechaParseada;
        }
      }

      if (espacio) {
        consultaData.espacio = espacio;
      }

      if (personas) {
        consultaData.personas = personas;
      }

      const response = await axios.post('http://localhost:3001/api/chatbot/consultar-disponibilidad', consultaData);

      const { disponible, mensaje, espacios, sugerencias } = response.data;

      let respuestaCompleta = mensaje;

      // Si hay espacios disponibles, mostrarlos de forma organizada
      if (espacios && espacios.length > 0) {
        if (disponible === true) {
          // Mostrar detalles del espacio disponible
          const espacio = espacios[0];
          respuestaCompleta += '\n\n📋 **Detalles del espacio:**';
          respuestaCompleta += `\n${this.getEmojiEspacio(espacio.nombre)} ${espacio.nombre}`;
          respuestaCompleta += `\n👥 Capacidad: ${espacio.capacidad} personas`;
          respuestaCompleta += `\n💰 Costo base: $${espacio.costo_base.toLocaleString('es-CL')}`;
          if (espacio.descripcion) {
            respuestaCompleta += `\n📝 ${espacio.descripcion}`;
          }
        } else if (disponible === false && espacios.length > 1) {
          // Mostrar espacios alternativos
          respuestaCompleta += '\n\n🏡 **Espacios disponibles:**';
          espacios.forEach((espacio, index) => {
            respuestaCompleta += `\n\n${index + 1}. ${this.getEmojiEspacio(espacio.nombre)} **${espacio.nombre}**`;
            respuestaCompleta += `\n   👥 ${espacio.capacidad} personas`;
            respuestaCompleta += `\n   💰 $${espacio.costo_base.toLocaleString('es-CL')}`;
          });
        }
      }

      // Si hay sugerencias, mostrarlas
      if (sugerencias && sugerencias.length > 0) {
        respuestaCompleta += '\n\n💡 **Espacios sugeridos para tu capacidad:**';
        sugerencias.forEach((espacio, index) => {
          respuestaCompleta += `\n\n${index + 1}. ${this.getEmojiEspacio(espacio.nombre)} **${espacio.nombre}**`;
          respuestaCompleta += `\n   👥 ${espacio.capacidad} personas`;
          respuestaCompleta += `\n   💰 $${espacio.costo_base.toLocaleString('es-CL')}`;
        });
      }

      // Agregar call-to-action apropiado
      if (disponible === true) {
        respuestaCompleta += '\n\n🎉 ¿Te gustaría hacer la reserva? Puedes hacerlo desde nuestra página principal.';
      } else if (espacios && espacios.length > 0) {
        respuestaCompleta += '\n\n¿Te interesa alguno de estos espacios? Puedo consultar su disponibilidad específica.';
      }

      const message = this.createChatBotMessage(respuestaCompleta, {
        widget: 'initialOptions',
      });
      this.addMessageAndScroll(message);

    } catch (error) {
      console.error('Error al consultar disponibilidad específica:', error);

      let errorMsg = 'Hubo un error al consultar la disponibilidad. ';

      if (error.response && error.response.status === 400) {
        errorMsg += error.response.data.error || 'Verifica los datos proporcionados.';
      } else {
        errorMsg += 'Por favor intenta más tarde o contáctanos directamente.';
      }

      const errorMessage = this.createChatBotMessage(errorMsg, {
        widget: 'contacto',
      });
      this.addMessageAndScroll(errorMessage);
    }
  };

  // Helper para parsear fechas en diferentes formatos
  parsearFecha = (fechaTexto) => {
    const hoy = new Date();
    const texto = fechaTexto.toLowerCase();

    // Casos especiales
    if (texto.includes('hoy')) {
      return hoy.toISOString().split('T')[0];
    }

    if (texto.includes('mañana')) {
      const mañana = new Date(hoy);
      mañana.setDate(hoy.getDate() + 1);
      return mañana.toISOString().split('T')[0];
    }

    if (texto.includes('pasado mañana')) {
      const pasadoMañana = new Date(hoy);
      pasadoMañana.setDate(hoy.getDate() + 2);
      return pasadoMañana.toISOString().split('T')[0];
    }

    // Patrón "5 de julio" -> "2025-07-05"
    const patronMes = texto.match(/(\d{1,2})\s*de\s*(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
    if (patronMes) {
      const dia = parseInt(patronMes[1]);
      const meses = {
        'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
        'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
      };
      const mes = meses[patronMes[2]];
      const año = hoy.getFullYear();

      // Si el mes ya pasó este año, usar el próximo año
      const fechaCreada = new Date(año, mes - 1, dia);
      if (fechaCreada <= hoy) {
        fechaCreada.setFullYear(año + 1);
      }

      return fechaCreada.toISOString().split('T')[0];
    }

    // Patrones numéricos DD/MM/YYYY o DD/MM
    const patronNumerico = texto.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/);
    if (patronNumerico) {
      const dia = parseInt(patronNumerico[1]);
      const mes = parseInt(patronNumerico[2]);
      const año = patronNumerico[3] ? parseInt(patronNumerico[3]) : hoy.getFullYear();

      const fechaCreada = new Date(año, mes - 1, dia);
      if (fechaCreada <= hoy && !patronNumerico[3]) {
        fechaCreada.setFullYear(año + 1);
      }

      return fechaCreada.toISOString().split('T')[0];
    }

    return null;
  };
}

export default ActionProvider;
