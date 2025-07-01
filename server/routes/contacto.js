const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'tu_email@gmail.com', // Configura esto en tu .env
        pass: process.env.EMAIL_PASS || 'tu_contraseña_app'   // Configura esto en tu .env
    }
});

// Función para enviar correo
const enviarCorreoContacto = async (datosContacto) => {
    const { nombre, telefono, correo, mensaje } = datosContacto;
    
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #8B4CF7 0%, #6B46C1 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h2>📞 Nuevo Contacto desde Chatbot</h2>
                <p>El Patio de Lea - Asistente Virtual</p>
            </div>
            
            <div style="padding: 20px; background: #f8fafc;">
                <h3 style="color: #8B4CF7; margin-bottom: 15px;">Información del Cliente:</h3>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #8B4CF7;">
                    <strong>👤 Nombre:</strong> ${nombre}
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #4ECDC4;">
                    <strong>📞 Teléfono:</strong> ${telefono}
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #FFD93D;">
                    <strong>📧 Correo:</strong> ${correo}
                </div>
                
                ${mensaje ? `
                <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #FF6B9D;">
                    <strong>💬 Mensaje:</strong><br>
                    <p style="margin-top: 10px; line-height: 1.5;">${mensaje}</p>
                </div>
                ` : ''}
                
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #FF8A65;">
                    <strong>🕒 Fecha y Hora:</strong> ${new Date().toLocaleString('es-CL')}
                </div>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="margin: 0; color: #1976d2; font-size: 14px;">
                    <strong>⚡ Acción requerida:</strong> Contactar al cliente en la brevedad posible
                </p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@elpatiodale.cl',
        to: 'benjaf243@gmail.com',
        subject: `🔔 Nuevo contacto desde chatbot - ${nombre}`,
        html: htmlContent
    };

    return transporter.sendMail(mailOptions);
};

// Endpoint para manejar mensajes de contacto desde el chatbot
router.post('/contacto-chatbot', async (req, res) => {
    console.log('Endpoint POST /api/contacto-chatbot llamado');
    console.log('Datos recibidos:', req.body);

    const { nombre, telefono, correo, mensaje } = req.body;

    if (!nombre || !telefono || !correo) {
        return res.status(400).json({
            error: 'Nombre, teléfono y correo son requeridos'
        });
    }

    try {
        // Enviar correo de notificación
        await enviarCorreoContacto({ nombre, telefono, correo, mensaje });
        
        console.log('Correo de contacto enviado exitosamente a benjaf243@gmail.com');
        console.log('Mensaje de contacto recibido:', {
            nombre,
            telefono, 
            correo,
            mensaje: mensaje || 'Sin mensaje específico',
            fecha: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            message: 'Mensaje de contacto enviado correctamente. Nos contactaremos contigo pronto.'
        });

    } catch (error) {
        console.error('Error al enviar correo de contacto:', error);
        
        // Aunque falle el correo, registramos el contacto
        console.log('Mensaje de contacto recibido (sin envío de correo):', {
            nombre,
            telefono, 
            correo,
            mensaje: mensaje || 'Sin mensaje específico',
            fecha: new Date().toISOString()
        });

        res.status(200).json({
            success: true,
            message: 'Mensaje de contacto recibido. Nos contactaremos contigo pronto.'
        });
    }
});

module.exports = router;
