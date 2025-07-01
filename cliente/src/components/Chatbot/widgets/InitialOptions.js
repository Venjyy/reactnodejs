import React from 'react';
import './Widgets.css';

const InitialOptions = (props) => {
  const options = [
    {
      text: '📝 Modificar Reserva',
      handler: props.actionProvider.handleModificarReserva,
      id: 1,
    },
    {
      text: '❓ Preguntas Frecuentes',
      handler: props.actionProvider.handleFAQ,
      id: 2,
    },
    {
      text: '📞 Contacto Directo',
      handler: props.actionProvider.handleContacto,
      id: 3,
    },
  ];

  const buttonsMarkup = options.map((option) => (
    <button
      key={option.id}
      onClick={option.handler}
      className="option-button"
    >
      {option.text}
    </button>
  ));

  return <div className="options-container">{buttonsMarkup}</div>;
};

export default InitialOptions;
