import { getControlChannel } from '../config/settings.js';
import { sendEmail } from '../../alerts/emailAlert.js';
import logger from '../services/logger.js';
import { setPauseState } from '../services/pauseState.js';

export default async function panicRoutes(app, { redis, panicState }) {
  app.post('/test/panic', async (req, reply) => {
    if (process.env.SANDBOX_MODE !== 'true') {
      return reply.code(403).send();
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
    panicState.reason = req.body?.type || null;
    await redis.publish(getControlChannel(), 'halt');
    logger.warn(
      JSON.stringify({
        event: 'panic',
        reason: panicState.reason || 'manual',
        value: req.body?.value || 0,
        ts: new Date().toISOString(),
      })
    );
    try {
      await sendEmail('Panic brake triggered (test mode)', 'Trading halted due to panic');
      logger.info('Panic alert email sent');
    } catch (err) {
      logger.warn(`Panic alert email failed: ${err.message}`);
    }
    await redis.publish('control-feed', 'panic');
    return { paused: true, source: 'manual' };
  });
}
