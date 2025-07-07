#!/usr/bin/env node

// scripts/mock-ghost-feed.js
// Publish fake ghost trades to a Redis channel every N milliseconds.
// Useful for testing the dashboard overlay without running the backend engine.

const minimist = require('minimist');
const Redis = require('ioredis');

const args = minimist(process.argv.slice(2), {
  string: ['host', 'port', 'channel', 'interval'],
  alias: { h: 'host', p: 'port', c: 'channel', i: 'interval' },
  default: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    channel: process.env.GHOST_FEED_CHANNEL || 'ghost_feed',
    interval: 2000,
  },
});

const redis = new Redis({ host: args.host, port: Number(args.port) });

function rand(min, max, digits = 2) {
  const num = Math.random() * (max - min) + min;
  return Number(num.toFixed(digits));
}

function buildTrade() {
  return {
    ts: Date.now(),
    edge: rand(-0.2, 0.5, 4),
    latency: Math.floor(rand(50, 250)),
    prediction: rand(0, 1, 3),
    pnl: rand(-10, 10, 2),
  };
}

function publish() {
  const trade = buildTrade();
  redis.publish(args.channel, JSON.stringify(trade)).catch((err) => {
    console.error('Redis publish failed:', err.message);
  });
}

console.log(
  `Publishing mock trades to redis://${args.host}:${args.port}/${args.channel} every ${args.interval}ms`,
);

publish();
setInterval(publish, Number(args.interval));
