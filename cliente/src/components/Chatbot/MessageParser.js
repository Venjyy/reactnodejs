class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const lowercase = message.toLowerCase();

    // Detectar patrones de RUT (con o sin formato)
    const rutPattern = /\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]/;
    if (rutPattern.test(message)) {
      const rutEncontrado = message.match(rutPattern)[0];
      this.actionProvider.handleRutInput(rutEncontrado);
      return;
    }

    // Detectar comandos específicos
    if (lowercase.includes('modificar') || lowercase.includes('cambiar') || lowercase.includes('reserva')) {
      this.actionProvider.handleModificarReserva();
    } else if (lowercase.includes('faq') || lowercase.includes('pregunta') || lowercase.includes('ayuda')) {
      this.actionProvider.handleFAQ();
    } else if (lowercase.includes('contacto') || lowercase.includes('telefono') || lowercase.includes('correo')) {
      this.actionProvider.handleContacto();
    } else if (lowercase.includes('volver') || lowercase.includes('menu') || lowercase.includes('inicio')) {
      this.actionProvider.handleBackToMenu();
    } else {
      // Respuesta por defecto
      this.actionProvider.handleDefault();
    }
  }
}

export default MessageParser;
