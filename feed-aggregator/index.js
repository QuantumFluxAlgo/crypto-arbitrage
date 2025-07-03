const WebSocket = require('ws');
const Redis = require('ioredis');
const winston = require('winston');

const FEED_URL = process.env.FEED_URL || 'wss://example.com/feed';
const CHANNEL = 'orderbook';

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

const redis = new Redis();

function normalize(data) {
  const bids = (data.bids || data.b || []).map(pair => [Number(pair[0]), Number(pair[1])]);
  const asks = (data.asks || data.a || []).map(pair => [Number(pair[0]), Number(pair[1])]);
  return { bids, asks };
}

function connect(attempt = 0) {
  const ws = new WebSocket(FEED_URL);

  ws.on('open', () => {
    logger.info('Connected to feed');
    attempt = 0;
  });

  ws.on('message', (msg) => {
    try {
      const payload = JSON.parse(msg);
      const book = normalize(payload);
      redis.publish(CHANNEL, JSON.stringify(book));
    } catch (err) {
      logger.error(`Failed to process message: ${err.message}`);
    }
  });

  ws.on('close', () => reconnect());
  ws.on('error', (err) => {
    logger.error(`WebSocket error: ${err.message}`);
    ws.close();
  });

  function reconnect() {
    const delay = Math.min(30000, Math.pow(2, attempt) * 1000);
    logger.warn(`Reconnecting in ${delay}ms`);
    setTimeout(() => connect(attempt + 1), delay);
  }
}

connect();
