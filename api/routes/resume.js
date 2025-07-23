import { requireAdmin } from '../middleware/auth.js';
import { sendAlert } from '../../alerts/alertAgent.js';
import { getControlChannel } from '../config/settings.js';
import fs from 'fs';
import path from 'path';
import { ensurePaused } from '../middleware/validate.js';
import logger from '../services/logger.js';
import { setPauseState } from '../services/pauseState.js';

export default async function resumeRoutes(app, opts) {
  const { redis, panicState } = opts;
  const logDir = process.env.LOG_DIR || '/var/log/prism-arbitrage';
  const resumeLog = path.join(logDir, 'resume.log');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  function logAttempt(event, operator, extra = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      operator,
      ...extra,
    };
    fs.appendFile(resumeLog, JSON.stringify(entry) + '\n', () => {});
  }

  app.post(
    '/resume',
    { preHandler: [requireAdmin, ensurePaused(redis)] },
    async (req, reply) => {
    const user = req.user?.email || 'unknown';

    const health = await app.inject({ method: 'GET', url: '/api/system/health' });
    let healthy = false;
    try {
      const body = JSON.parse(health.payload);
      healthy = body.healthy === true;
    } catch {}
    if (health.statusCode !== 200 || !healthy) {
      logAttempt('resume_blocked_health', user);
      reply.code(403);
      return { error: 'System not healthy \u2014 resume denied' };
    }

    const confirm = req.query.confirm === 'true';
    if (!confirm && (panicState.reason === 'loss' || panicState.reason === 'latency')) {
      logAttempt('resume_needs_override', user, { reason: panicState.reason });
      reply.code(403);
      return { override_required: true };
    }

    if (confirm) {
      await redis.set('resume_confirmed', 'true', 'EX', 60);
    }

    const channel = getControlChannel();
    await redis.publish(channel, 'resume');
    await setPauseState(redis, false);
    panicState.reason = null;
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
    logAttempt('resume_success', user);
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
  }
  );
}
