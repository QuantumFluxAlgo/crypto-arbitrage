import { getControlChannel } from '../config/settings.js';
import logger from '../services/logger.js';
import { PAUSE_KEY } from '../services/pauseState.js';

export default async function alertRoutes(app, { redis }) {
  app.post('/alert/panic', async (req, reply) => {
    const source = req.body?.source || 'unknown';
    const timestamp = new Date().toISOString();

    try {
      const last = await redis.get('panic_last_ts');
      const now = Date.now();
      if (last && now - parseInt(last, 10) < 30000) {
        logger.info(JSON.stringify({ event: 'panic_ignored', ts: timestamp }));
        return { paused: true, ignored: true, triggeredBy: source, timestamp };
      }
      const val = await redis.get(PAUSE_KEY);
      const alreadyPaused = val === 'true';
      if (!alreadyPaused) {
        await redis.set(PAUSE_KEY, 'true');
        await redis.publish(getControlChannel(), 'halt');
      }
      await redis.set('panic_last_ts', String(now));
      logger.warn(
        JSON.stringify({
          event: 'panic',
          reason: req.body?.type || 'alert',
          value: req.body?.value || 0,
          ts: timestamp,
        })
      );
      return { paused: true, triggeredBy: source, timestamp };
    } catch (err) {
      logger.error('[REDIS ERROR] Could not set pause state from alert trigger');
      reply.code(503);
      return { error: 'service unavailable' };
    }
  });
}
