class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const lowercase = message.toLowerCase();
    const trimmed = message.trim();

    // Detectar patrones de RUT (con o sin formato)
    const rutPattern = /\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]/;
    if (rutPattern.test(message)) {
      const rutEncontrado = message.match(rutPattern)[0];
      this.actionProvider.handleRutInput(rutEncontrado);
      return;
    }

    // Sistema de detección de múltiples intenciones
    const intenciones = this.detectarIntenciones(lowercase);

    // NUEVO: Detectar consultas específicas de disponibilidad con datos
    const consultaDisponibilidad = this.analizarConsultaDisponibilidad(lowercase);
    if (consultaDisponibilidad.esConsultaEspecifica) {
      this.actionProvider.handleConsultaDisponibilidadEspecifica(consultaDisponibilidad);
      return;
    }

    // Análisis especial para mensajes complejos
    const intencionCompleja = this.analizarMensajeComplejo(lowercase);
    if (intencionCompleja) {
      const incluyeSaludo = intenciones.includes('saludo');
      if (incluyeSaludo) {
        this.actionProvider.handleRespuestaCombinada(intencionCompleja, true);
      } else {
        this.ejecutarIntencion(intencionCompleja);
      }
      return;
    }

    // Si hay múltiples intenciones, priorizar y dar respuesta combinada
    if (intenciones.length > 1) {
      this.manejarIntencionesCombinadas(intenciones, trimmed);
      return;
    }

    // Si solo hay una intención, usar el sistema original
    if (intenciones.length === 1) {
      this.ejecutarIntencion(intenciones[0]);
      return;
    }

    // Detectar comandos específicos existentes
    if (lowercase.includes('modificar') || lowercase.includes('cambiar') || lowercase.includes('reserva')) {
      this.actionProvider.handleModificarReserva();
    } else if (lowercase.includes('faq') || lowercase.includes('pregunta') || lowercase.includes('ayuda')) {
      this.actionProvider.handleFAQ();
    } else if (lowercase.includes('contacto') || lowercase.includes('telefono') || lowercase.includes('correo')) {
      this.actionProvider.handleContacto();
    } else if (lowercase.includes('volver') || lowercase.includes('menu') || lowercase.includes('inicio')) {
      this.actionProvider.handleBackToMenu();
    } else {
      // Respuesta personalizada más inteligente
      this.actionProvider.handlePersonalizedResponse(trimmed);
    }
  }

  // Nuevo sistema: detectar múltiples intenciones en un mensaje
  detectarIntenciones(text) {
    const intenciones = [];

    if (this.isSaludo(text)) intenciones.push('saludo');
    if (this.isDespedida(text)) intenciones.push('despedida');
    if (this.isHorarios(text)) intenciones.push('horarios');
    if (this.isPrecios(text)) intenciones.push('precios');
    if (this.isServicios(text)) intenciones.push('servicios');
    if (this.isUbicacion(text)) intenciones.push('ubicacion');
    if (this.isReserva(text)) intenciones.push('reserva');
    if (this.isDisponibilidad(text)) intenciones.push('disponibilidad');

    return intenciones;
  }

  // Manejar respuestas combinadas cuando hay múltiples intenciones
  manejarIntencionesCombinadas(intenciones, mensajeOriginal) {
    // Orden de prioridad: información específica > saludos/despedidas
    const prioridad = ['reserva', 'disponibilidad', 'horarios', 'precios', 'servicios', 'ubicacion', 'saludo', 'despedida'];

    // Encontrar la intención más prioritaria
    let intencionPrincipal = null;
    for (const intent of prioridad) {
      if (intenciones.includes(intent)) {
        intencionPrincipal = intent;
        break;
      }
    }

    // Detectar si hay saludo al inicio
    const incluyeSaludo = intenciones.includes('saludo');

    // Ejecutar respuesta combinada
    if (intencionPrincipal && incluyeSaludo && intencionPrincipal !== 'saludo') {
      this.actionProvider.handleRespuestaCombinada(intencionPrincipal, incluyeSaludo);
    } else {
      this.ejecutarIntencion(intencionPrincipal);
    }
  }

  // Ejecutar una intención específica
  ejecutarIntencion(intencion) {
    switch (intencion) {
      case 'saludo':
        this.actionProvider.handleSaludo();
        break;
      case 'despedida':
        this.actionProvider.handleDespedida();
        break;
      case 'horarios':
        this.actionProvider.handleHorarios();
        break;
      case 'precios':
        this.actionProvider.handlePrecios();
        break;
      case 'servicios':
        this.actionProvider.handleServicios();
        break;
      case 'ubicacion':
        this.actionProvider.handleUbicacion();
        break;
      case 'reserva':
        this.actionProvider.handleReservaInfo();
        break;
      case 'disponibilidad':
        this.actionProvider.handleDisponibilidad();
        break;
      default:
        this.actionProvider.handleDefault();
    }
  }

  // Detectores de patrones mejorados
  isSaludo(text) {
    const saludos = ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hello', 'hi', 'hey', 'que tal', 'como estas', 'saludos'];
    return saludos.some(saludo => text.includes(saludo));
  }

  isDespedida(text) {
    const despedidas = ['chao', 'adios', 'nos vemos', 'hasta luego', 'bye', 'gracias', 'perfecto', 'listo', 'ok', 'muchas gracias', 'excelente'];
    return despedidas.some(despedida => text.includes(despedida));
  }

  isHorarios(text) {
    const horarios = ['horario', 'hora', 'abren', 'cierran', 'atienden', 'funcionan', 'abierto', 'cerrado', 'que hora', 'a que hora', 'horarios de atencion'];
    return horarios.some(horario => text.includes(horario));
  }

  isPrecios(text) {
    const precios = ['precio', 'costo', 'cuanto', 'valor', 'tarifa', 'cobran', 'pagar', 'cuanto cuesta', 'cuanto vale', 'costos'];
    return precios.some(precio => text.includes(precio));
  }

  isServicios(text) {
    const servicios = ['servicio', 'espacio', 'salon', 'cancha', 'campo', 'quincho', 'ofrecen', 'tienen', 'disponible', 'que espacios', 'que servicios'];
    return servicios.some(servicio => text.includes(servicio));
  }

  isUbicacion(text) {
    const ubicacion = ['donde', 'ubicacion', 'direccion', 'como llegar', 'ubicado', 'queda', 'donde estan', 'donde se encuentra'];
    return ubicacion.some(ubi => text.includes(ubi));
  }

  isReserva(text) {
    const reserva = ['reservar', 'agendar', 'apartar', 'reserva', 'hacer reserva', 'quiero reservar', 'me gustaria reservar', 'necesito reservar'];
    return reserva.some(res => text.includes(res));
  }

  isDisponibilidad(text) {
    const disponibilidad = ['disponible', 'libre', 'ocupado', 'fecha', 'dia', 'cuando', 'disponibilidad', 'esta libre', 'tienen disponible'];
    return disponibilidad.some(disp => text.includes(disp));
  }

  // Análisis más inteligente para frases complejas
  analizarMensajeComplejo(text) {
    // Detectar frases de intención
    const frasesIntencion = [
      'me gustaria saber',
      'quisiera saber',
      'necesito saber',
      'quiero saber',
      'me puedes decir',
      'puedes decirme',
      'me interesa saber',
      'necesito información',
      'requiero información'
    ];

    const tieneIntencionConsulta = frasesIntencion.some(frase => text.includes(frase));

    if (tieneIntencionConsulta) {
      // Si detectamos intención de consulta, buscar qué información específica quiere
      const intenciones = this.detectarIntenciones(text);

      // Filtrar solo las intenciones informativas (no saludos/despedidas)
      const intencionesInfo = intenciones.filter(i =>
        !['saludo', 'despedida'].includes(i)
      );

      if (intencionesInfo.length > 0) {
        return intencionesInfo[0]; // Retornar la primera intención informativa
      }
    }

    return null;
  }

  // NUEVO: Detectar consultas específicas de disponibilidad con datos - MEJORADO
  analizarConsultaDisponibilidad(text) {
    const resultado = {
      esConsultaEspecifica: false,
      fecha: null,
      espacio: null,
      personas: null
    };

    // Patrones mejorados para detectar consultas de disponibilidad
    const palabrasClaveDisponibilidad = [
      'disponibilidad', 'disponible', 'libre', 'ocupado',
      'consultar', 'verificar', 'revisar', 'para fecha',
      'tienen disponible', 'esta libre', 'esta ocupado',
      'hay espacio', 'tienen espacio', 'para el', 'el dia'
    ];

    const tieneConsulta = palabrasClaveDisponibilidad.some(palabra => text.includes(palabra));

    if (!tieneConsulta) {
      return resultado;
    }

    // Extraer fecha con patrones mejorados
    const patronesFecha = [
      /(?:para|el|fecha)\s+(\d{1,2})\s+de\s+(\w+)/i,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /(?:fecha|para|el)\s+(\d{1,2})\s+(\w+)/i
    ];

    let fechaEncontrada = null;
    for (const patron of patronesFecha) {
      const match = text.match(patron);
      if (match) {
        if (match[1] && match[2]) {
          // Formato "5 de julio" o "fecha 15 julio"
          const dia = match[1];
          const mes = this.convertirMesANumero(match[2]);
          if (mes) {
            const año = new Date().getFullYear();
            fechaEncontrada = `${año}-${mes.toString().padStart(2, '0')}-${dia.padStart(2, '0')}`;
          }
        } else if (match[3]) {
          // Formato completo
          if (match[0].includes('/')) {
            fechaEncontrada = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
          } else if (match[0].includes('-')) {
            fechaEncontrada = match[0];
          }
        }
        break;
      }
    }

    // Extraer espacio con patrones mejorados
    const patronesEspacio = [
      /(?:en|espacio)\s+([a-zA-Z0-9\s]+?)(?:\s+con|\s+para|\s*,|$)/i,
      /(?:salon|quincho|cancha|terraza|sala)\s*([a-zA-Z0-9\s]*)/i,
      /([A-Z][A-Z0-9]+)/g // Capturar palabras en mayúsculas como ESPACIOTEST
    ];

    let espacioEncontrado = null;
    for (const patron of patronesEspacio) {
      const match = text.match(patron);
      if (match && match[1]) {
        espacioEncontrado = match[1].trim();
        if (espacioEncontrado.length > 2) { // Solo si tiene más de 2 caracteres
          break;
        }
      }
    }

    // Extraer número de personas con patrones mejorados
    const patronesPersonas = [
      /(?:con|para)\s+(\d+)\s+persona/i,
      /(\d+)\s+persona/i,
      /para\s+(\d+)/i
    ];

    let personasEncontradas = null;
    for (const patron of patronesPersonas) {
      const match = text.match(patron);
      if (match && match[1]) {
        personasEncontradas = parseInt(match[1]);
        break;
      }
    }

    // Determinar si es una consulta específica
    const tieneAlMenosUnDato = fechaEncontrada || espacioEncontrado || personasEncontradas;

    if (tieneConsulta && tieneAlMenosUnDato) {
      resultado.esConsultaEspecifica = true;
      resultado.fecha = fechaEncontrada;
      resultado.espacio = espacioEncontrado;
      resultado.personas = personasEncontradas;
    }

    return resultado;
  }

  // Helper mejorado para convertir nombres de meses a números
  convertirMesANumero(mesTexto) {
    const meses = {
      'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
      'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
      'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
    };
    return meses[mesTexto.toLowerCase()] || null;
  }

  // ...existing code...
}

export default MessageParser;
