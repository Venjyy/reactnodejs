import React, { useState } from 'react';
import './Widgets.css';

const FAQWidget = (props) => {
  const [selectedFAQ, setSelectedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: '¿Cuáles son los horarios de atención?',
      answer: 'Nuestros horarios de atención son de Lunes a Domingo de 10:00 a 22:00 horas. Para eventos especiales podemos coordinar horarios extendidos.'
    },
    {
      id: 2,
      question: '¿Qué incluye el servicio de catering?',
      answer: 'Nuestro servicio de catering incluye menús personalizados, servicio de meseros, montaje de mesas, vajilla y cristalería. Tenemos opciones vegetarianas y veganas disponibles.'
    },
    {
      id: 3,
      question: '¿Puedo cancelar o modificar mi reserva?',
      answer: 'Sí, puedes modificar tu reserva hasta 48 horas antes del evento. Para cancelaciones, aplicamos nuestra política de reembolso según el tiempo de anticipación.'
    },
    {
      id: 4,
      question: '¿Qué capacidad máxima tienen los espacios?',
      answer: 'Nuestros espacios tienen diferentes capacidades: Salón Principal (150 personas), Terraza (80 personas), Jardín (200 personas), y Salón Íntimo (50 personas).'
    },
    {
      id: 5,
      question: '¿Incluyen decoración?',
      answer: 'Ofrecemos paquetes básicos de decoración incluidos. Para decoraciones temáticas o especiales, trabajamos con proveedores especializados con costo adicional.'
    },
    {
      id: 6,
      question: '¿Hay estacionamiento disponible?',
      answer: 'Sí, contamos con estacionamiento gratuito para 50 vehículos. Para eventos grandes coordinamos estacionamiento adicional en convenio.'
    }
  ];

  const toggleFAQ = (faqId) => {
    setSelectedFAQ(selectedFAQ === faqId ? null : faqId);
  };

  const volver = () => {
    props.actionProvider.handleBackToMenu();
  };

  return (
    <div className="widget-container">
      <h4>Preguntas Frecuentes</h4>
      <div className="faq-list">
        {faqs.map((faq) => (
          <div key={faq.id} className="faq-item">
            <button
              onClick={() => toggleFAQ(faq.id)}
              className="faq-question"
            >
              <span>{faq.question}</span>
              <span className={`faq-arrow ${selectedFAQ === faq.id ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {selectedFAQ === faq.id && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={volver} className="widget-button secondary">
        Volver al Menú
      </button>
    </div>
  );
};

export default FAQWidget;
