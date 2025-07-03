const axios = require('axios');

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(message, attempt = 1) {
  if (!TOKEN || !CHAT_ID) {
    throw new Error('Missing TELEGRAM_TOKEN or TELEGRAM_CHAT_ID');
  }

  try {
    await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
    });
  } catch (error) {
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      return sendTelegram(message, attempt + 1);
    }
    throw error;
  }
}

module.exports = { sendTelegram };

