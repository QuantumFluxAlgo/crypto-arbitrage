import { requireAdmin } from '../middleware/auth.js';
import { sendAlert } from '../../alerts/alertAgent.js';
import { getControlChannel } from '../config/settings.js';
import logger from '../services/logger.js';
import { setPauseState, getPauseState } from '../services/pauseState.js';
import { setResumeConfirmation } from '../../RedisPublisher.js';

export default async function resumeRoutes(app, opts) {
  const { redis, panicState } = opts;

  app.post('/resume', { preHandler: [requireAdmin] }, async (req, reply) => {
    const paused = await getPauseState(redis);
    if (!paused) {
      reply.code(400);
      return { error: 'not paused' };
    }

    const confirm = req.query.confirm === 'true';
    const lossBreach = await redis.get('loss_breached');
    const latencyBreach = await redis.get('latency_breached');

    if (!confirm && (lossBreach === 'true' || latencyBreach === 'true')) {
      reply.code(403);
      return { override_required: true };
    }

    if (confirm) {
      await setResumeConfirmation(redis);
    }

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
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'resume_triggered',
        component: 'api',
        source: 'dashboard',
        operator: user,
      }),
    );
    return { resumed: true };
  });
}
