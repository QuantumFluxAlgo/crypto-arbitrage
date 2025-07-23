import settings from '../config/settings.js';
import logger from './logger.js';

const KEYS = {
  maxLossPct: 'config:maxLossPct',
  latencyMaxMs: 'config:latencyMaxMs',
  coinExposureLimit: 'config:coinExposureLimit',
};

let source = 'fallback';

export async function loadSettingsFromRedis(redis) {
  source = 'fallback';
  const envDefaults = {
    maxLossPct: parseFloat(process.env.LOSS_CAP_PCT || settings.maxLossPct),
    latencyMaxMs: parseFloat(process.env.LATENCY_MAX_MS || settings.latencyMaxMs),
    coinExposureLimit: parseFloat(process.env.COIN_CAP_PCT || settings.coinExposureLimit),
  };
  if (!redis || typeof redis.mget !== 'function') {
    Object.assign(settings, envDefaults);
    return source;
  }
  try {
    const [loss, latency, coin] = await redis.mget(
      KEYS.maxLossPct,
      KEYS.latencyMaxMs,
      KEYS.coinExposureLimit,
    );
    if (loss) {
      settings.maxLossPct = JSON.parse(loss).value;
      source = 'redis';
    } else {
      settings.maxLossPct = envDefaults.maxLossPct;
    }
    if (latency) {
      settings.latencyMaxMs = JSON.parse(latency).value;
      source = 'redis';
    } else {
      settings.latencyMaxMs = envDefaults.latencyMaxMs;
    }
    if (coin) {
      settings.coinExposureLimit = JSON.parse(coin).value;
      source = 'redis';
    } else {
      settings.coinExposureLimit = envDefaults.coinExposureLimit;
    }
    logger.info(
      `Config loaded from Redis: { maxLossPct: ${settings.maxLossPct}, latencyMaxMs: ${settings.latencyMaxMs}, coinCap: ${settings.coinExposureLimit} }`,
    );
  } catch (err) {
    Object.assign(settings, envDefaults);
    logger.error(`[REDIS] Failed to load config: ${err.message}`);
  }
  return source;
}

export function getConfigSource() {
  return source;
}

export default {
  loadSettingsFromRedis,
  getConfigSource,
};
