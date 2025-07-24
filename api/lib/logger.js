import winston from 'winston';

const levels = { error: 0, warn: 1, audit: 2, info: 3, debug: 4 };

export default function createLogger(service = 'app') {
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
