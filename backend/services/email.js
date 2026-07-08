const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function notifierEmail(sujet, texte) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP_USER ou SMTP_PASS manquant — notification email ignorée');
    return;
  }
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'LKM_BUSINESS'}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: sujet,
      text: texte,
    });
    console.log('✅ Email de notification envoyé:', sujet);
  } catch (err) {
    console.error('❌ Erreur notification email:', err.message);
  }
}

module.exports = { notifierEmail };
