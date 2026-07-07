// Notification WhatsApp via CallMeBot (https://www.callmebot.com/blog/free-api-whatsapp-messages/)
async function notifierWhatsApp(message) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const phone = process.env.ADMIN_WHATSAPP_NUMBER;
  if (!apiKey || !phone) {
    console.warn('⚠️ CALLMEBOT_API_KEY ou ADMIN_WHATSAPP_NUMBER manquant — notification WhatsApp ignorée');
    return;
  }
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(apiKey)}`;
    await fetch(url);
  } catch (err) {
    console.error('❌ Erreur notification WhatsApp:', err.message);
  }
}

module.exports = { notifierWhatsApp };
