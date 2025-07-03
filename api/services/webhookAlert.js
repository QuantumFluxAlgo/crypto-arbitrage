const axios = require('axios');

const WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL;

async function sendWebhook(payload, attempt = 1) {
  if (!WEBHOOK_URL) {
    throw new Error('ALERT_WEBHOOK_URL not set');
  }

  try {
    await axios.post(WEBHOOK_URL, payload);
    console.log('Webhook alert sent');
  } catch (error) {
    console.error('Failed to send webhook alert', error.message);
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      return sendWebhook(payload, attempt + 1);
    }
    throw error;
  }
}

module.exports = { sendWebhook };
