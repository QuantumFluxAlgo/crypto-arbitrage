import { getControlChannel } from '../config/settings.js';
import { sendAlert } from '../../alerts/alertAgent.js';
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
    const ts = new Date().toISOString();
    logger.warn(
      `[AUDIT] panic triggered by ${req.user?.email || 'unknown'} ` +
        `${JSON.stringify({ reason: panicState.reason || 'manual', value: req.body?.value || 0 })} at ${ts}`
    );
    try {
      await sendAlert('email', 'Panic brake triggered (test mode)', 'panic');
    } catch (err) {
      logger.error('[ALERT FAILURE] Panic alert email failed to send: missing SMTP config');
    }
    return { paused: true, source: 'manual' };
  });
}
