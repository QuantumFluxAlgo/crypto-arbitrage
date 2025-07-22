import winston from 'winston';
import axios from 'axios';
import fs from 'fs';

const logDir = process.env.LOG_DIR || '/var/log/prism-arbitrage';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const service = process.env.SERVICE_NAME || 'api';

class HttpTransport extends winston.Transport {
  constructor(opts) {
    super(opts);
    this.url = opts.url;
  }
  log(info, callback) {
    axios.post(this.url, info).catch(() => {});
    callback();
  }
}

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: `${logDir}/${service}.log` }),
];
const forwardUrl = process.env.LOKI_URL || process.env.LOG_FORWARD_URL;
if (forwardUrl) {
  transports.push(new HttpTransport({ url: forwardUrl }));
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) =>
      `${timestamp} ${level} [${service}] ${message}`
    )
  ),
  transports,
});

export default logger;
