import axios from 'axios';
import logger from './logger.js';

const WEBHOOK_URL = process.env.WEBHOOK_URL;

async function sendWebhook(payload, attempt = 1) {
  if (!WEBHOOK_URL) {
    throw new Error('Missing WEBHOOK_URL');
  }

  const body =
    typeof payload === 'string' ? { message: payload } : payload;

  try {
    await axios.post(WEBHOOK_URL, body);
    logger.info('Webhook alert sent');
  } catch (error) {
    logger.error(`Failed to send webhook alert: ${error.message}`);
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      return sendWebhook(payload, attempt + 1);
    }
    throw error;
  }
}

export { sendWebhook };
