import { getControlChannel } from '../config/settings.js';
import { sendAlert } from '../../alerts/alertAgent.js';
import logger from '../services/logger.js';
import { setPauseState } from '../services/pauseState.js';

export default async function panicRoutes(app, { redis, panicState }) {
  app.post('/test/panic', async (req, reply) => {
    if (process.env.SANDBOX_MODE !== 'true') {
      return reply.code(403).send();
    }
    await setPauseState(redis, true);
    panicState.reason = req.body?.type || null;
    await redis.publish(getControlChannel(), 'halt');
    logger.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'panic_triggered',
        component: 'api',
        source: 'dashboard',
        operator: req.user?.email || 'unknown',
      }),
    );
    try {
      await sendAlert('email', 'Panic brake triggered (test mode)');
    } catch (err) {
      logger.error('[ALERT FAILURE] Panic alert email failed to send: missing SMTP config');
    }
    return { paused: true, source: 'manual' };
  });
}
