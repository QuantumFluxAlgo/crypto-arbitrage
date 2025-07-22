const WebSocket = require("ws");
const Redis = require("ioredis");
const Fastify = require("fastify");
const winston = require("winston");
const createLogger = require("../lib/logger.js");
const fs = require("fs");
const normalize = require("./lib/normalize");

const logDir = process.env.LOG_DIR || "/var/log/prism-arbitrage";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const FEED_URL = process.env.FEED_URL || "wss://example.com/feed";
const CHANNEL = process.env.ORDERBOOK_CHANNEL || "orderbook";
const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const HEALTH_PORT = process.env.HEALTH_PORT || 8090;
const MAX_RECONNECT_ATTEMPTS = parseInt(
  process.env.MAX_RECONNECT_ATTEMPTS || "5",
  10
);
const MAX_RECONNECT_DELAY = 30000;

let reconnectAttempts = 0;

const service = "feed-aggregator";

const logger = createLogger(service);
logger.add(new winston.transports.File({ filename: `${logDir}/${service}.log` }));

const redis = process.env.MOCK_REDIS
  ? { publish: () => Promise.resolve() }
  : new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const ALERT_CHANNEL = process.env.ALERT_CHANNEL || "alerts";
const THROTTLE_MS = parseInt(process.env.THROTTLE_MS || "60000", 10);
const lastAlertTimes = {};

function fallbackAlert(payload) {
  fs.appendFile(
    `${logDir}/alerts-fallback.log`,
    `${new Date().toISOString()} ${payload}\n`,
    (err) => {
      if (err) logger.error("Failed to write fallback alert", err);
    }
  );
  logger.warn("Alert fallback engaged - redis unavailable");
}

function sendAlert(type, message) {
  const payload = JSON.stringify({
    type,
    message,
    source: "feed-aggregator",
    ts: Date.now(),
  });

  if (
    lastAlertTimes[message] &&
    Date.now() - lastAlertTimes[message] < THROTTLE_MS
  ) {
    logger.debug(`Alert suppressed for '${message}'`);
    return Promise.resolve();
  }
  lastAlertTimes[message] = Date.now();

  return redis.publish(ALERT_CHANNEL, payload).catch((err) => {
    logger.error("Failed to publish alert", err);
    fallbackAlert(payload);
  });
}

function cleanupAlertCache() {
  const now = Date.now();
  for (const [msg, ts] of Object.entries(lastAlertTimes)) {
    if (now - ts > THROTTLE_MS) {
      delete lastAlertTimes[msg];
    }
  }
}

setInterval(cleanupAlertCache, THROTTLE_MS).unref();


function connect() {
  const ws = new WebSocket(FEED_URL);

  function reconnect() {
      reconnectAttempts += 1;
      if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        logger.error("Max reconnect attempts reached; giving up");
        sendAlert(
          "email",
          "Feed reconnect attempts exceeded. Manual intervention required."
        );
        return;
      }
    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    ) {
      ws.terminate();
    }

    const delay = Math.min(
      MAX_RECONNECT_DELAY,
      Math.pow(2, reconnectAttempts - 1) * 1000
    );
    logger.warn(
      `Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`
    );
    setTimeout(() => connect(), delay);
  }

  ws.on("open", () => {
    logger.info("Feed connected");
    reconnectAttempts = 0;
  });

  ws.on("message", (msg) => {
    try {
      const book = normalize(JSON.parse(msg));
      redis.publish(CHANNEL, JSON.stringify(book)).catch((err) => {
        logger.error("Redis publish failed", err);
        sendAlert("email", `Redis publish failed: ${err.message}`);
      });
    } catch (err) {
      logger.error("Bad message", err);
      sendAlert("telegram", `Feed parse error: ${err.message}`);
    }
  });

  ws.on("close", () => {
    logger.error("WebSocket closed unexpectedly");
    sendAlert("email", "Feed WebSocket closed unexpectedly");
    reconnect();
  });

  ws.on("error", (err) => {
    logger.error(`WebSocket error: ${err.message}`);
    sendAlert("email", `Feed connection error: ${err.message}`);
    reconnect();
  });
}

// small health endpoint
const app = Fastify();
app.get("/health", async () => ({ ok: true }));

if (require.main === module) {
  app.listen({ port: HEALTH_PORT, host: "0.0.0.0" });
  connect();
}

module.exports = {
  normalize,
  sendAlert,
  cleanupAlertCache,
  _lastAlertTimes: lastAlertTimes,
};
