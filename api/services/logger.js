import fs from 'fs';
import axios from 'axios';
import winston from 'winston';
import createLogger from '../../lib/logger.js';

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

const logger = createLogger(service);
logger.add(new winston.transports.File({ filename: `${logDir}/${service}.log` }));
const forwardUrl = process.env.LOKI_URL || process.env.LOG_FORWARD_URL;
if (forwardUrl) {
  logger.add(new HttpTransport({ url: forwardUrl }));
}

export default logger;
