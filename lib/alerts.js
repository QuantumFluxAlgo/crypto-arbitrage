const fs = require('fs');
const Redis = require('ioredis');
const createLogger = require('./logger.js');

const logDir = process.env.LOG_DIR || '/var/log/prism';
// Logs in this directory will be rotated externally in the future
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const ALERT_CHANNEL = process.env.ALERT_CHANNEL || 'alerts';
const THROTTLE_MS = parseInt(process.env.THROTTLE_MS || '60000', 10);
const lastAlertTimes = {};

const redis = process.env.MOCK_REDIS
  ? { publish: () => Promise.resolve() }
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
    });

function fallbackAlert(payload, logger) {
  fs.appendFile(
    `${logDir}/alerts-fallback.log`,
    `${new Date().toISOString()} ${payload}\n`,
    (err) => {
      if (err) logger.error('Failed to write fallback alert', err);
    }
  );
  logger.warn('Alert fallback engaged - redis unavailable');
}

function sendAlert(service, type, message, logger = createLogger(service)) {
  const payload = JSON.stringify({
    type,
    message,
    source: service,
    ts: Date.now(),
  });

  if (lastAlertTimes[message] && Date.now() - lastAlertTimes[message] < THROTTLE_MS) {
    logger.debug(`Alert suppressed for '${message}'`);
    return Promise.resolve();
  }
  lastAlertTimes[message] = Date.now();

  return redis.publish(ALERT_CHANNEL, payload).catch((err) => {
    logger.error('Failed to publish alert', err);
    fallbackAlert(payload, logger);
  });
}

function cleanupAlertCache() {
  const now = Date.now();
  for (const [msg, ts] of Object.entries(lastAlertTimes)) {
    if (now - ts > THROTTLE_MS) {
      delete lastAlertTimes[msg];
    }
  }
}

setInterval(cleanupAlertCache, THROTTLE_MS).unref();

module.exports = {
  sendAlert,
  cleanupAlertCache,
  _lastAlertTimes: lastAlertTimes,
};
