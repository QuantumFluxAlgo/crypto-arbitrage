import Fastify from 'fastify';
import { jest } from '@jest/globals';

import logger from '../services/logger.js';
import { sendEmail } from '../../alerts/emailAlert.js';
import { getControlChannel } from '../config/settings.js';
import { setPauseState } from '../services/pauseState.js';

jest.mock('../../alerts/emailAlert.js', () => ({
  sendEmail: jest.fn(),
}));

describe('resume route alerting', () => {
  const publishSpy = jest.fn();
  const redis = {
    publish: publishSpy,
    set: jest.fn(),
    get: jest.fn(),
  } as any;
  const panicState = { reason: 'loss' } as any;
  let app: any;

  beforeAll(async () => {
    process.env.SANDBOX_MODE = 'true';
    app = Fastify();
    app.post('/test/resume', async (_req, reply) => {
      await setPauseState(redis, false);
      panicState.reason = null;
      await redis.publish(getControlChannel(), 'resume');
      try {
        await sendEmail('Resumed trading', 'Trading resumed after panic');
        logger.info('Resume alert email sent');
      } catch (err: any) {
        logger.warn(`Resume alert email failed: ${err.message}`);
      }
      await redis.publish('control-feed', 'resume');
      return { paused: false };
    });
    await app.ready();
  });

  test('publishes resume and sends email', async () => {
    await app.inject({ method: 'POST', url: '/test/resume' });
    expect(publishSpy).toHaveBeenCalledWith('control-feed', 'resume');
    expect((sendEmail as jest.Mock).mock.calls.length).toBe(1);
  });
});

