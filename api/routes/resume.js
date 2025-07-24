import { requireAdmin } from '../middleware/auth.js';
import { sendAlert } from '../services/alertManager.js';
import { getControlChannel } from '../config/settings.js';
import fs from 'fs';
import path from 'path';
import logger from '../services/logger.js';
import { getPauseState, setPauseState, RESUME_ACK_KEY, RESUME_FAILED_KEY } from '../services/pauseState.js';
import { resumeCounter } from './metrics.js';

export default async function resumeRoutes(app, opts) {
  const { redis, panicState } = opts;
  const logDir = process.env.LOG_DIR || '/var/log/prism';
  // log rotation will be managed externally
  const resumeLog = path.join(logDir, 'resume.log');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  function logAttempt(event, operator, mode, extra = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      operator,
      mode,
      ...extra,
    };
    fs.appendFile(resumeLog, JSON.stringify(entry) + '\n', () => {});
    logger.audit(
      `[RESUME] ${event} mode=${mode} user=${operator} ${JSON.stringify(extra)}`
    );
  }

  app.post(
    '/resume',
    { preHandler: requireAdmin },
    async (req, reply) => {
    const user = req.user?.email || 'unknown';
    const mode =
      process.env.EXECUTION_MODE ||
      (process.env.SANDBOX_MODE === 'true' ? 'dry-run-sandbox' : 'live');
    const source = req.body?.source || 'api';
    logAttempt('resume_attempt', user, mode, { source });

    const paused = await getPauseState(redis);
    if (!paused) {
      logAttempt('resume_not_paused', user, mode);
      reply.code(409);
      return { error: 'System is not paused' };
    }

    const health = await app.inject({ method: 'GET', url: '/api/system/health' });
    let healthy = false;
    try {
      const body = JSON.parse(health.payload);
      healthy = body.healthy === true;
    } catch {}
    if (health.statusCode !== 200 || !healthy) {
      logAttempt('resume_blocked_health', user, mode);
      reply.code(403);
      return { error: 'System not healthy \u2014 resume denied' };
    }

    const confirm = req.body?.confirm === true;
    if (mode === 'live' && !confirm) {
      logAttempt('resume_missing_confirm', user, mode);
      reply.code(400);
      return { error: 'confirmation_required' };
    }
    if (!confirm && (panicState.reason === 'loss' || panicState.reason === 'latency')) {
      logAttempt('resume_needs_override', user, mode, { reason: panicState.reason });
      reply.code(403);
      return { override_required: true };
    }

    if (confirm) {
      logAttempt('resume_override_attempt', user, mode, { reason: panicState.reason });
      await redis.set('resume_confirmed', 'true', 'EX', 60);
    }

    const channel = getControlChannel();
    await redis.set(RESUME_FAILED_KEY, 'false');
    await redis.publish(channel, 'resume');
    await setPauseState(redis, false);
    logger.info('[RESUME SIGNAL RECEIVED]');
    panicState.reason = null;

    let ack = false;
    const start = Date.now();
    while (Date.now() - start < 5000) {
      const val = await redis.get(RESUME_ACK_KEY);
      if (val === 'true') {
        ack = true;
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }
    if (!ack) {
      await redis.publish(channel, 'resume');
      await redis.set(RESUME_FAILED_KEY, 'true');
    } else {
      await redis.del(RESUME_FAILED_KEY);
    }
    const msg = `Trading resumed by ${user} at ${new Date().toISOString()}`;
    await redis.publish('alerts', msg);
    try {
      await redis.publish(channel, msg);
      logger.info('Published resume notice to control-feed');
    } catch (err) {
      logger.warn('Failed to publish resume notice', err);
    }
    try {
      await sendAlert('email', msg, 'resume');
    } catch (err) {
      req.log.warn('Resume alert failed', err);
    }
    logAttempt('resume_success', user, mode, { confirmed: confirm, source });
    resumeCounter.inc();
    logger.info(
      JSON.stringify({ event: 'resume', ts: new Date().toISOString() })
    );
    return { status: 'resumed', confirmed: confirm, mode };
  }
  );
}
