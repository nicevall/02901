require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: process.env.SMTP_USER,
  subject: '📧 Prueba de envío',
  text: 'Este es un correo de prueba.',
}).then(info => {
  console.log('✅ Correo de prueba enviado:', info.messageId);
}).catch(err => {
  console.error('❌ Error al enviar correo:', err);
});
