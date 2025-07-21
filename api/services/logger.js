import winston from 'winston';
import fs from 'fs';

const logDir = process.env.LOG_DIR || '/var/log/prism-arbitrage';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const service = process.env.SERVICE_NAME || 'api';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) =>
      `${timestamp} ${level} [${service}] ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `${logDir}/${service}.log` }),
  ],
});

export default logger;
