import logger from './logger.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let realSendAlert;
let realSendEmail;
let modulesLoaded = false;

function loadModules() {
  if (modulesLoaded) return;
  try {
    const alertAgent = require('../../alerts/alertAgent.js');
    realSendAlert = alertAgent.sendAlert || (alertAgent.default && alertAgent.default.sendAlert);
  } catch {
    logger.warn('alertAgent.js not found; using stub alerts');
    realSendAlert = async () => {};
  }
  try {
    const emailMod = require('../../alerts/emailAlert.js');
    realSendEmail = emailMod.sendEmail || (emailMod.default && emailMod.default.sendEmail);
  } catch {
    logger.warn('emailAlert.js not found; using stub email alert');
    realSendEmail = async () => {};
  }
  modulesLoaded = true;
}

function missingEmailCreds() {
  return !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.ALERT_RECIPIENT;
}

function missingTelegramCreds() {
  return !process.env.TELEGRAM_TOKEN || !process.env.TELEGRAM_CHAT_ID;
}

export async function sendAlert(type, message, category = 'generic') {
  if (process.env.DRY_RUN === 'true') {
    logger.info(`\uD83D\uDD15 [DRY_RUN] Alert skipped: ${message}`);
    return;
  }
  loadModules();
  try {
    if (type === 'email' && missingEmailCreds()) {
      logger.warn('\u26A0\uFE0F Alert not sent: missing credentials');
      return;
    }
    if (type === 'telegram' && missingTelegramCreds()) {
      logger.warn('\u26A0\uFE0F Alert not sent: missing credentials');
      return;
    }
    await realSendAlert(type, message, category);
  } catch (err) {
    logger.warn(`\u26A0\uFE0F Alert not sent: ${err.message}`);
  }
}

export async function sendEmail(subject, body, category = 'generic') {
  if (process.env.DRY_RUN === 'true') {
    logger.info(`\uD83D\uDD15 [DRY_RUN] Alert skipped: ${body}`);
    return;
  }
  loadModules();
  if (missingEmailCreds()) {
    logger.warn('\u26A0\uFE0F Alert not sent: missing credentials');
    return;
  }
  try {
    await realSendEmail(subject, body, category);
  } catch (err) {
    logger.warn(`\u26A0\uFE0F Alert not sent: ${err.message}`);
  }
}
