const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

logger.info('API service started');
logger.error('API service encountered an error');
