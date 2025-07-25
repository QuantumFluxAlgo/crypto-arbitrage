import logger from '../services/logger.js';
import {
  getPauseState,
  setPauseState,
  RESUME_ACK_KEY,
} from '../services/pauseState.js';
import { settings as currentSettings } from './settings.js';

export default async function testOpsRoutes(app, opts) {
  const { redis, panicState } = opts;

  app.post('/test/resume', async (req, reply) => {
    if (process.env.SANDBOX_MODE !== 'true') {
      return reply.code(403).send();
    }
    let wasPaused = false;
    try {
      wasPaused = await getPauseState(redis);
    } catch {
      req.log.warn('Redis unavailable when checking pause state');
    }
    if (!wasPaused) {
      reply.code(400);
      return { resumed: false, wasPaused: false };
    }
    await setPauseState(redis, false);
    panicState.reason = null;
    try {
      await redis.publish(RESUME_ACK_KEY, 'resume');
    } catch (err) {
      req.log.warn('Redis publish failed', err);
    }
    return { resumed: true, wasPaused: true };
  });

  app.post('/test/sweep', async (req) => {
    if (process.env.SANDBOX_MODE !== 'true') {
      return { status: 'forbidden' };
    }
    req.log.info('Dry-run sweep triggered');
    return { status: 'dry-run', triggered: true };
  });

  app.post('/test/reset', async (req) => {
    if (process.env.DRY_RUN !== 'true') {
      return { status: 'forbidden' };
    }
    Object.assign(currentSettings, {
      schema_version: 1,
      canary_mode: false,
      useEnsemble: true,
      shadowOnly: false,
      ghost_mode: false,
      sandbox_mode: process.env.SANDBOX_MODE === 'true',
      personality_mode: 'Realistic',
      sweep_cadence: 'None',
      maxLoss: 0,
      maxLossPct: 0,
      latencyMaxMs: 250,
      coinExposureLimit: 10,
    });
    req.log.info('✅ Test state reset');
    return { status: 'reset' };
  });
}
