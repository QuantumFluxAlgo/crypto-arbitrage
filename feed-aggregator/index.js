const WebSocket = require('ws');
const Redis = require('ioredis');
const Fastify = require('fastify');
const { sendAlert } = require('../api/services/alertManager');
const winston = require('winston');

const FEED_URL = process.env.FEED_URL || 'wss://example.com/feed';
const CHANNEL = 'orderbook';
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  transports: [new winston.transports.Console()]
});

const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT });

function normalize(data) {
  const bids = (data.bids || data.b || []).map(p => [Number(p[0]), Number(p[1])]);
  const asks = (data.asks || data.a || []).map(p => [Number(p[0]), Number(p[1])]);
  return { bids, asks };
}

function connect(attempt = 0) {
  const ws = new WebSocket(FEED_URL);

  ws.on('open', () => {
      logger.info('Feed connected');
      attempt = 0;
  });

    ws.on('message', msg => {
    try {
        const book = normalize(JSON.parse(msg));
        redis.publish(CHANNEL, JSON.stringify(book)).catch(err => {
          logger.error('Redis publish failed', err);
          sendAlert('email', `Redis publish failed: ${err.message}`);
        });
    } catch (err) {
        logger.error('Bad message', err);
        sendAlert('telegram', `Feed parse error: ${err.message}`);
    }
  });

    ws.on('close', () => {
      logger.error('WebSocket closed unexpectedly');
      sendAlert('email', 'Feed WebSocket closed unexpectedly');
      reconnect();
    });

    ws.on('error', err => {
      logger.error(`WebSocket error: ${err.message}`);
      ws.terminate();
      sendAlert('email', `Feed connection error: ${err.message}`);
    });

    function reconnect() {
      const delay = Math.min(30000, Math.pow(2, attempt) * 1000);
      logger.warn(`Reconnecting in ${delay}ms`);
      setTimeout(() => connect(attempt + 1), delay);
    }
}

// small health endpoint
const app = Fastify();
app.get('/health', async () => ({ ok: true }));
app.listen({ port: 8090, host: '0.0.0.0' });

connect();
