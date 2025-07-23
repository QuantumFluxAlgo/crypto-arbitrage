import { requireAdmin } from '../middleware/auth.js';
import { sendAlert } from '../../alerts/alertAgent.js';
import { getControlChannel } from '../config/settings.js';
import { ensurePaused } from '../middleware/validate.js';
import logger from '../services/logger.js';
import { setPauseState } from '../services/pauseState.js';

export default async function resumeRoutes(app, opts) {
  const { redis, panicState } = opts;

  app.post(
    '/resume',
    { preHandler: [requireAdmin, ensurePaused(redis)] },
    async (req, reply) => {
    const channel = getControlChannel();
    await redis.publish(channel, 'resume');
    await setPauseState(redis, false);
    panicState.reason = null;
    const user = req.user?.email || 'unknown';
    const msg = `Trading resumed by ${user} at ${new Date().toISOString()}`;
    await redis.publish('alerts', msg);
    if (process.env.SANDBOX_MODE !== 'true') {
      try {
        await sendAlert('email', msg);
      } catch (err) {
        req.log.error('Resume alert failed', err);
      }
    } else {
      req.log.info(`[DRY-RUN] Resume alert: ${msg}`);
    }
    logger.info('[RESUME] Trading re-enabled by operator');
    return { resumed: true };
  }
  );
}
