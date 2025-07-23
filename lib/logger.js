const winston = require('winston');

// Logs are persisted to /var/log/prism. Rotation will be managed via
// an external logrotate configuration in a future release.

const levels = { error: 0, warn: 1, audit: 2, info: 3, debug: 4 };

function createLogger(service = 'app') {
  const logger = winston.createLogger({
    levels,
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [new winston.transports.Console()],
  });
  logger.audit = (...args) => logger.log('audit', ...args);
  return logger;
}

module.exports = createLogger;
