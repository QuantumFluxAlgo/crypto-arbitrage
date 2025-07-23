import logger from './logger.js';

export async function redisReachable(redis) {
  try {
    await redis.ping();
    return true;
  } catch (err) {
    return false;
  }
}

export async function fetchBalances(pool, redis) {
  let balances = [];
  let source = 'postgres';
  let complete = true;
  try {
    const { rows } = await pool.query('SELECT asset, usd_value FROM wallet_balances');
    balances = rows || [];
    if (balances.length === 0) complete = false;
  } catch (err) {
    logger.warn('[SWEEP] Postgres unavailable, falling back to Redis');
    source = 'redis';
    complete = false;
    try {
      const data = await redis.hgetall('wallet_balances');
      balances = Object.entries(data).map(([asset, val]) => ({ asset, usd_value: parseFloat(val) }));
      if (Object.keys(data).length > 0) complete = true;
    } catch (err2) {
      // ignore, handled by incomplete flag
    }
  }
  if (!complete) {
    logger.warn('[SWEEP WARNING] Balance source incomplete – operator review recommended');
  }
  return { balances, source, complete };
}
