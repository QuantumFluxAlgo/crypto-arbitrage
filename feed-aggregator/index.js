import WebSocket from 'ws';
import Redis from 'ioredis';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

const redis = new Redis();

const WS_URL = process.env.FEED_URL || 'wss://example.com/feed';
let ws;
let backoff = 1000;

function connect() {
ws = new WebSocket(WS_URL);

  ws.on('open', () => {
      logger.info('Feed connected');
      backoff = 1000;
  });

    ws.on('message', msg => {
    try {
        const data = JSON.parse(msg);
        const normalized = {
          pair: data.pair,
          bid: data.bid,
          ask: data.ask,
          timestamp: Date.now()
        };
        redis.publish('orderbook', JSON.stringify(normalized));
    } catch (err) {
        logger.error('bad message', err);
    }
  });

  ws.on('close', () => reconnect());
    ws.on('error', () => ws.terminate());
  }

function reconnect() {
  logger.warn(`Reconnecting in ${backoff}ms`);
  setTimeout(connect, backoff);
  backoff = Math.min(backoff * 2, 30000);
}

connect();
