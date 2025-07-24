import { getControlChannel, getExecutionMode, ExecutionMode } from '../config/settings.js';
// import alertAgent from '../../alerts/alertAgent.js';
// const { sendAlert } = alertAgent;
import logger from '../services/logger.js';
import {
  setPauseState,
  getPauseState,
  PANIC_TRIGGER_KEY,
} from '../services/pauseState.js';

export default async function panicRoutes(app, { redis, panicState }) {
  app.post('/test/panic', async (req, reply) => {
    const mode = getExecutionMode(req);
    const allowed = [ExecutionMode.DRY_RUN, ExecutionMode.SANDBOX];
    if (!allowed.includes(mode)) {
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
    const user = req.user?.email || req.user?.id || req.ip || 'unknown';
    panicState.last = now;
    try {
      await redis.set('panic_last_ts', String(now));
    } catch (err) {
      logger.warn('Redis unavailable for panic timestamp');
    }
    await setPauseState(redis, true);
    const reason = req.body?.type || 'manual override';
    const source = req.body?.source || 'api';
    logger.warn(`[PANIC TRIGGERED] mode=${mode} source=${source}`);
    logger.audit(
      `[PANIC] ts=${new Date().toISOString()} mode=${mode} user=${user} source=${source} reason=${reason}`
    );
    panicState.reason = req.body?.type || null;
    try {
      await redis.publish(PANIC_TRIGGER_KEY, reason);
      await redis.publish(getControlChannel(), 'halt');
      logger.info('Published panic halt to control-feed');
    } catch (err) {
      logger.warn('Failed to publish panic event', err);
    }
    logger.warn(
      JSON.stringify({
        event: 'panic',
        reason: panicState.reason || 'manual override',
        value: req.body?.value || 0,
        mode,
        source,
        ts: new Date().toISOString(),
      })
    );
    try {
      // await sendAlert('email', 'Panic brake triggered (test mode)', 'panic');
      logger.info('Panic email alert sent');
    } catch (err) {
      logger.error(`[ALERT FAILURE] Panic alert email failed to send: ${err.message}`);
    }
    return { status: 'panic_triggered', paused: true, mode, reason };
  });
}
