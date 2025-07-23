import { getControlChannel } from '../config/settings.js';
import { sendAlert } from '../../alerts/alertAgent.js';
import logger from '../services/logger.js';
import { setPauseState, getPauseState } from '../services/pauseState.js';

export default async function panicRoutes(app, { redis, panicState }) {
  app.post('/test/panic', async (req, reply) => {
    if (process.env.SANDBOX_MODE !== 'true') {
      return reply.code(403).send();
    }
    const alreadyPaused = await getPauseState(redis);
    if (alreadyPaused) {
      return { message: 'Already paused' };
    }
    const now = Date.now();
    if (now - (panicState.last || 0) < 30000) {
      logger.info(
        JSON.stringify({ event: 'panic_ignored', ts: new Date().toISOString() })
      );
      return { paused: true, ignored: true };
    }
    panicState.last = now;
    await redis.set('panic_last_ts', String(now));
    await setPauseState(redis, true);
    logger.warn('[PANIC TRIGGERED]');
    panicState.reason = req.body?.type || null;
    try {
      await redis.publish(getControlChannel(), 'halt');
      logger.info('Published panic halt to control-feed');
    } catch (err) {
      logger.error('Failed to publish panic halt', err);
    }
    logger.warn(
      JSON.stringify({
        event: 'panic',
        reason: panicState.reason || 'manual',
        value: req.body?.value || 0,
        ts: new Date().toISOString(),
      })
    );
    try {
      await sendAlert('email', 'Panic brake triggered (test mode)', 'panic');
      logger.info('Panic email alert sent');
    } catch (err) {
      logger.error(`[ALERT FAILURE] Panic alert email failed to send: ${err.message}`);
    }
    return { paused: true, source: 'manual' };
  });
}
