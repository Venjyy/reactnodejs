import React, { useState, useEffect, useRef } from 'react';
import Chatbot from 'react-chatbot-kit';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import config from './config';
import './ChatBot.css';

const ChatBotComponent = () => {
  const [showChat, setShowChat] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeStep, setWelcomeStep] = useState(0);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const chatContainerRef = useRef(null);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  // Sistema de bienvenida automática
  useEffect(() => {
    if (!hasShownWelcome) {
      // Mostrar bienvenida después de 2 segundos
      const timer = setTimeout(() => {
        setShowWelcome(true);
        setWelcomeStep(1);

        // Primer mensaje: "¡Bienvenido!" después de 1 segundo
        setTimeout(() => {
          setWelcomeStep(2);

          // Segundo mensaje: "Si necesitas ayuda aquí estoy!" después de 2.5 segundos más
          setTimeout(() => {
            setWelcomeStep(3);

            // Ocultar bienvenida después de 6 segundos más (aumentamos duración)
            setTimeout(() => {
              setShowWelcome(false);
              setWelcomeStep(0);
              setHasShownWelcome(true);
            }, 6000);
          }, 2500);
        }, 1000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasShownWelcome]);

  // Auto-scroll hacia abajo cuando se abra el chat
  useEffect(() => {
    if (showChat) {
      setTimeout(() => {
        const chatContainer = document.querySelector('.react-chatbot-kit-chat-container');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
  }, [showChat]);

  // Función para reiniciar la bienvenida (para testing)
  const resetWelcome = () => {
    setHasShownWelcome(false);
    setShowWelcome(false);
    setWelcomeStep(0);
  };

  return (
    <div className="chatbot-container">
      {/* Sistema de Bienvenida */}
      {showWelcome && (
        <div className="welcome-system">
          {/* Robot Avatar Animado */}
          <div className={`welcome-robot ${welcomeStep >= 1 ? 'robot-appear' : ''}`}>
            <div className="robot-body">
              <div className="robot-head">
                <div className="robot-eyes">
                  <div className="robot-eye left"></div>
                  <div className="robot-eye right"></div>
                </div>
                <div className="robot-mouth"></div>
              </div>
              <div className="robot-antenna">
                <div className="antenna-ball"></div>
              </div>
            </div>

            {/* Efectos de partículas */}
            <div className="robot-particles">
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
              <div className="particle particle-4"></div>
            </div>
          </div>

          {/* Contenedor de Mensajes */}
          <div className="welcome-messages">
            {/* Mensaje 1: "¡Bienvenido!" */}
            {welcomeStep >= 2 && (
              <div className="welcome-message message-1">
                <div className="message-bubble">
                  <span className="message-text">¡Bienvenido!</span>
                  <div className="message-tail"></div>
                </div>
              </div>
            )}

            {/* Mensaje 2: "Si necesitas ayuda aquí estoy!" */}
            {welcomeStep >= 3 && (
              <div className="welcome-message message-2">
                <div className="message-bubble">
                  <span className="message-text">Si necesitas ayuda aquí estoy! Tan solo haz click aquí abajo para hablar conmigo</span>
                  <div className="message-tail"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <div
        className={`chat-toggle-button ${showChat ? 'active' : ''} ${showWelcome ? 'welcome-active' : ''}`}
        onClick={toggleChat}
      >
        {showChat ? (
          <span className="close-icon">✕</span>
        ) : (
          <span className="chat-icon">💬</span>
        )}

        {/* Indicador de pulso para llamar la atención */}
        {!hasShownWelcome && !showChat && (
          <div className="attention-pulse"></div>
        )}
      </div>

      {/* Ventana del chat */}
      {showChat && (
        <div className="chatbot-window" ref={chatContainerRef}>
          <div className="chatbot-header">
            <h3>Asistente Virtual (Venjy) </h3>
            <span>El Patio de Lea</span>
            {/* Botón para resetear bienvenida (solo para desarrollo/testing) */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={resetWelcome}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '10px',
                  background: 'transparent',
                  border: '1px solid white',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                Reset
              </button>
            )}
          </div>
          <div className="chatbot-content">
            <Chatbot
              config={config}
              messageParser={MessageParser}
              actionProvider={ActionProvider}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotComponent;
