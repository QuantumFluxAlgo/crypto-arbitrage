const fs = require('fs');
const axios = require('axios');
const winston = require('winston');
const createLogger = require('../lib/logger.js');

const logDir = process.env.LOG_DIR || '/var/log/prism';
// TODO: handle log rotation with logrotate
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const service = process.env.SERVICE_NAME || 'feed-aggregator';

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

module.exports = logger;
