import winston from 'winston';
import { sendEmail } from './emailAlert.js';
import { sendTelegram } from './telegramAlert.js';
import { sendWebhook } from './webhookAlert.js';

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

function hasEmailConfig() {
  return process.env.SMTP_USER && process.env.SMTP_PASS && process.env.ALERT_RECIPIENT;
}

function hasTelegramConfig() {
  return process.env.TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID;
}

function hasWebhookConfig() {
  return process.env.WEBHOOK_URL;
}

async function sendAlert(type, message) {
  try {
    switch (type) {
      case 'email':
        if (!hasEmailConfig()) {
          logger.warn('Email alert skipped: missing SMTP config');
          return;
        }
        await sendEmail('Crypto Alert', message);
        break;
      case 'telegram':
        if (!hasTelegramConfig()) {
          logger.warn('Telegram alert skipped: missing Telegram config');
          return;
        }
        await sendTelegram(message);
        break;
      case 'webhook':
        if (!hasWebhookConfig()) {
          logger.warn('Webhook alert skipped: missing WEBHOOK_URL');
          return;
        }
        await sendWebhook(message);
        break;
      default:
        logger.warn(`Unknown alert type: ${type}`);
        return;
    }
    logger.info(`Alert dispatched via ${type}`);
  } catch (err) {
    logger.error(`Failed to send ${type} alert: ${err.message}`);
  }
}

export { sendAlert };
