import { WebSocketServer } from 'ws';
import Redis from 'ioredis';
import logger from './logger.js';

const WS_PORT = process.env.WS_PORT || 8070;
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

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
  redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
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

