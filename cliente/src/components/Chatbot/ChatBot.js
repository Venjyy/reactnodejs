import React, { useState, useEffect, useRef } from 'react';
import Chatbot from 'react-chatbot-kit';
import ActionProvider from './ActionProvider';
import MessageParser from './MessageParser';
import config from './config';
import './ChatBot.css';

const ChatBotComponent = () => {
  const [showChat, setShowChat] = useState(false);
  const chatContainerRef = useRef(null);

  const toggleChat = () => {
    setShowChat(!showChat);
  };

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

  return (
    <div className="chatbot-container">
      {/* Botón flotante */}
      <div 
        className={`chat-toggle-button ${showChat ? 'active' : ''}`} 
        onClick={toggleChat}
      >
        {showChat ? (
          <span className="close-icon">✕</span>
        ) : (
          <span className="chat-icon">💬</span>
        )}
      </div>

      {/* Ventana del chat */}
      {showChat && (
        <div className="chatbot-window" ref={chatContainerRef}>
          <div className="chatbot-header">
            <h3>Asistente Virtual (Venjy) </h3>
            <span>El Patio de Lea</span>
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
