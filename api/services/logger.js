import winston from 'winston';

const service = process.env.SERVICE_NAME || 'api';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) =>
      `${timestamp} ${level} [${service}] ${message}`
    )
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
