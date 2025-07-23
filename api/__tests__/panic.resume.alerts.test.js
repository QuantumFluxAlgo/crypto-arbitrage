import { jest } from '@jest/globals';
import Fastify from 'fastify';
import panicRoutes from '../routes/panic.js';
import resumeRoutes from '../routes/resume.js';
import { getControlChannel } from '../config/settings.js';
import alertAgent from '../../alerts/alertAgent.js';
const { sendAlert } = alertAgent;

jest.mock('../../alerts/alertAgent.js', () => ({
  default: {
    sendAlert: jest.fn(async () => {})
  }
}));

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';

function createRedis(initialPaused = 'false') {
  const store = { 'arb:paused_state': initialPaused };
  return {
    publish: jest.fn(async () => 1),
    get: jest.fn(async key => store[key]),
    set: jest.fn(async (key, val) => { store[key] = val; return 'OK'; }),
    del: jest.fn(async key => { delete store[key]; return 1; })
  };
}

describeLocal('panic and resume alerts', () => {
  test('panic publishes halt and sends email', async () => {
    const redis = createRedis('false');
    const app = Fastify();
    await app.register(panicRoutes, { redis, panicState: {} });
    await app.listen({ port: 0 });

    await app.inject({ method: 'POST', url: '/test/panic', payload: { type: 'loss' } });

    expect(redis.publish).toHaveBeenCalledWith(getControlChannel(), 'halt');
    expect(sendAlert).toHaveBeenCalledWith('email', expect.any(String), 'panic');
    await app.close();
  });

  test('resume publishes resume notice and sends email', async () => {
    const redis = createRedis('true');
    const panicState = { reason: null };
    const app = Fastify();
    app.get('/api/system/health', async () => ({ healthy: true }));
    await app.register(resumeRoutes, { redis, panicState });
    await app.listen({ port: 0 });

    await app.inject({ method: 'POST', url: '/resume' });

    const channel = getControlChannel();
    expect(redis.publish).toHaveBeenCalledWith(channel, 'resume');
    expect(redis.publish).toHaveBeenCalledWith(channel, expect.stringContaining('Trading resumed'));
    expect(sendAlert).toHaveBeenCalledWith('email', expect.stringContaining('Trading resumed'), 'resume');
    await app.close();
  });
});

