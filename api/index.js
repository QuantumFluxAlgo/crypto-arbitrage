const express = require('express');
const winston = require('winston');

const app = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

app.get('/', (req, res) => {
  logger.info('Received request on /');
  res.send('Hello World');
});

const PORT = process.env.PORT || 3000;
app
  .listen(PORT, () => {
    logger.info(`API listening on port ${PORT}`);
  })
  .on('error', (err) => {
    logger.error('API failed to start', err);
  });
