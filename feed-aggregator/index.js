const WebSocket = require('ws');
const Fastify = require('fastify');
const Redis = require('ioredis');
const logger = require('./logger.js');
const { sendAlert, cleanupAlertCache, _lastAlertTimes } = require('../lib/alerts.js');
const normalize = require('./lib/normalize');

const FEED_URL = process.env.FEED_URL || 'wss://example.com/feed';
const CHANNEL = process.env.ORDERBOOK_CHANNEL || 'orderbook';
const { URL } = require('url');
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const HEALTH_PORT = process.env.HEALTH_PORT || 8090;
const MAX_RECONNECT_ATTEMPTS = parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '5', 10);
const MAX_RECONNECT_DELAY = 30000;

let reconnectAttempts = 0;
let ws;

let redis;
if (process.env.MOCK_REDIS) {
  redis = { publish: () => Promise.resolve() };
} else {
  try {
    const { hostname, port } = new URL(REDIS_URL);
    redis = new Redis(REDIS_URL);
    logger.info(`[REDIS] Connected to ${hostname}:${port} via REDIS_URL`);
  } catch (err) {
    logger.error(`[REDIS] Invalid REDIS_URL: ${err.message}`);
    redis = new Redis();
  }
}

function handleReconnect() {
  reconnectAttempts += 1;
  if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
    logger.error('Max reconnect attempts reached; giving up');
    sendAlert('feed-aggregator', 'email', 'Feed reconnect attempts exceeded. Manual intervention required.');
    return;
  }
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    ws.terminate();
  }
  const delay = Math.min(MAX_RECONNECT_DELAY, Math.pow(2, reconnectAttempts - 1) * 1000);
  logger.warn(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
  setTimeout(setupConnection, delay);
}

function setupHandlers(socket) {
  socket.on('open', () => {
    logger.info('Feed connected');
    reconnectAttempts = 0;
  });

  socket.on('message', (msg) => {
    try {
      const book = normalize(JSON.parse(msg));
      redis.publish(CHANNEL, JSON.stringify(book)).catch((err) => {
        logger.error('Redis publish failed', err);
        sendAlert('feed-aggregator', 'email', `Redis publish failed: ${err.message}`);
      });
    } catch (err) {
      logger.error('Bad message', err);
      sendAlert('feed-aggregator', 'telegram', `Feed parse error: ${err.message}`);
    }
  });

  socket.on('close', () => {
    logger.error('WebSocket closed unexpectedly');
    sendAlert('feed-aggregator', 'email', 'Feed WebSocket closed unexpectedly');
    handleReconnect();
  });

  socket.on('error', (err) => {
    logger.error(`WebSocket error: ${err.message}`);
    sendAlert('feed-aggregator', 'email', `Feed connection error: ${err.message}`);
    handleReconnect();
  });
}

function setupConnection() {
  ws = new WebSocket(FEED_URL);
  setupHandlers(ws);
}

function connect() {
  setupConnection();
}

const app = Fastify();
app.get('/health', async () => ({ ok: true }));

if (require.main === module) {
  app.listen({ port: HEALTH_PORT, host: '0.0.0.0' });
  connect();
}

module.exports = {
  normalize,
  sendAlert: (type, message) => sendAlert('feed-aggregator', type, message),
  cleanupAlertCache,
  _lastAlertTimes,
  connect,
};
