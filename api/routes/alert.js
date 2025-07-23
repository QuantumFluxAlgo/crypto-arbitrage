import { getControlChannel } from '../config/settings.js';
import logger from '../services/logger.js';
import { PAUSE_KEY } from '../services/pauseState.js';

export default async function alertRoutes(app, { redis }) {
  app.post('/alert/panic', async (req, reply) => {
    const source = req.body?.source || 'unknown';
    const timestamp = new Date().toISOString();

    try {
      const val = await redis.get(PAUSE_KEY);
      const alreadyPaused = val === 'true';
      if (!alreadyPaused) {
        await redis.set(PAUSE_KEY, 'true');
        await redis.publish(getControlChannel(), 'halt');
      }
      logger.warn(
        JSON.stringify({
          timestamp,
          event: 'panic_triggered',
          component: 'api',
          source: 'alert_api',
          operator: source,
        }),
      );
      return { paused: true, triggeredBy: source, timestamp };
    } catch (err) {
      logger.error('[REDIS ERROR] Could not set pause state from alert trigger');
      reply.code(503);
      return { error: 'service unavailable' };
    }
  });
}
