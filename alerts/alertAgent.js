// Central alert dispatcher used by services or CLI
import logger from '../api/services/logger.js';
import { sendEmail } from './emailAlert.js';
import { sendTelegram } from './telegramAlert.js';
import { sendWebhook } from './webhookAlert.js';

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
  switch (type) {
    case 'email':
      if (!hasEmailConfig()) {
        logger.error('[ALERT FAILURE] Panic alert email failed to send: missing SMTP config');
        return;
      }
      try {
        await sendEmail('Crypto Alert', message);
        logger.info('Email alert sent');
      } catch (err) {
        logger.error(`[ALERT FAILURE] Panic alert email failed to send: ${err.message}`);
        throw err;
      }
      break;
    case 'telegram':
      if (!hasTelegramConfig()) {
        logger.warn('Telegram alert skipped: missing Telegram config');
        return;
      }
      try {
        await sendTelegram(message);
        logger.info('Telegram alert sent');
      } catch (err) {
        logger.error(`Telegram alert failed: ${err.message}`);
        throw err;
      }
      break;
    case 'webhook':
      if (!hasWebhookConfig()) {
        logger.warn('Webhook alert skipped: missing WEBHOOK_URL');
        return;
      }
      try {
        await sendWebhook(message);
        logger.info('Webhook alert sent');
      } catch (err) {
        logger.error(`Webhook alert failed: ${err.message}`);
        throw err;
      }
      break;
    default:
      logger.warn(`Unknown alert type: ${type}`);
      return;
  }
}

async function alertModelUpdate(versionHash, accuracy) {
  const msg = `Model updated to ${versionHash} — Accuracy: ${accuracy}`;
  await sendAlert('email', msg);
  await sendAlert('telegram', msg);
}

export { sendAlert, alertModelUpdate };
