import { createChatBotMessage } from 'react-chatbot-kit';
import InitialOptions from './widgets/InitialOptions';
import ModificarReservaWidget from './widgets/ModificarReservaWidget';
import FAQWidget from './widgets/FAQWidget';
import ContactoWidget from './widgets/ContactoWidget';

const config = {
  initialMessages: [
    createChatBotMessage('¡Hola! Soy el asistente virtual de El Patio de Lea. ¿En qué puedo ayudarte hoy?', {
      widget: 'initialOptions',
    }),
  ],
  botName: 'Asistente Virtual',
  customStyles: {
    botMessageBox: {
      backgroundColor: '#8B4CF7',
    },
    chatButton: {
      backgroundColor: '#8B4CF7',
    },
  },
  widgets: [
    {
      widgetName: 'initialOptions',
      widgetFunc: (props) => <InitialOptions {...props} />,
    },
    {
      widgetName: 'modificarReserva',
      widgetFunc: (props) => <ModificarReservaWidget {...props} />,
    },
    {
      widgetName: 'faq',
      widgetFunc: (props) => <FAQWidget {...props} />,
    },
    {
      widgetName: 'contacto',
      widgetFunc: (props) => <ContactoWidget {...props} />,
    },
  ],
};

export default config;
