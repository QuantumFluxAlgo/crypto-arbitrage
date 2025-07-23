// Lightweight WS server relaying ghost_feed messages
import { WebSocketServer } from 'ws';
import Redis from 'ioredis';
import logger from './logger.js';
import { URL } from 'url';

const WS_PORT = process.env.WS_PORT || 8070; // override via env for tests
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let wss;
let redis;
const clients = new Set();

function broadcast(message) {
  for (const socket of clients) {
    if (socket.readyState === socket.OPEN) {
      socket.send(message);
    } else {
      clients.delete(socket);
    }
  }
}

function start() {
  try {
    const { hostname, port } = new URL(REDIS_URL);
    redis = new Redis(REDIS_URL);
    logger.info(`[REDIS] Connected to ${hostname}:${port} via REDIS_URL`);
  } catch (err) {
    logger.error(`[REDIS] Invalid REDIS_URL: ${err.message}`);
    redis = new Redis();
  }
  wss = new WebSocketServer({ port: WS_PORT });

  wss.on('connection', socket => {
    clients.add(socket);
    socket.on('close', () => clients.delete(socket));
  });

  redis.subscribe('ghost_feed', err => {
    if (err) {
      logger.error('Failed to subscribe to ghost_feed', err);
    } else {
      logger.info('Subscribed to ghost_feed');
    }
  });

  redis.on('message', (channel, message) => {
    if (channel === 'ghost_feed') {
      broadcast(message);
    }
  });

  redis.on('error', err => {
    logger.error(`Redis error: ${err.message}`);
  });

  redis.on('end', () => {
    logger.warn('Redis connection ended');
  });

  logger.info(`WebSocket server listening on ${WS_PORT}`);
}

function stop() {
  if (wss) {
    wss.close();
    wss = undefined;
  }
  if (redis && typeof redis.quit === 'function') {
    redis.quit();
    redis = undefined;
  }
  clients.clear();
}

export { start, stop, wss };

