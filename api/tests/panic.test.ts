import Fastify from 'fastify';
import { jest } from '@jest/globals';

import panicRoutes from '../routes/panic.js';
import logger from '../services/logger.js';
import { sendEmail } from '../../alerts/emailAlert.js';

jest.mock('../../alerts/emailAlert.js', () => ({
  sendEmail: jest.fn(),
}));

describe('panic route alerting', () => {
  const publishSpy = jest.fn();
  const redis = {
    publish: publishSpy,
    set: jest.fn(),
    get: jest.fn(),
  } as any;
  const panicState = { reason: null, last: 0 } as any;
  let app: any;

  beforeAll(async () => {
    process.env.SANDBOX_MODE = 'true';
    app = Fastify();
    await panicRoutes(app, { redis, panicState });
    await app.ready();
  });

  test('publishes panic and sends email', async () => {
    await app.inject({ method: 'POST', url: '/test/panic' });
    expect(publishSpy).toHaveBeenCalledWith('control-feed', 'panic');
    expect((sendEmail as jest.Mock).mock.calls.length).toBe(1);
  });

  test('logs warn when email fails', async () => {
    (sendEmail as jest.Mock).mockRejectedValueOnce(new Error('smtp fail'));
    const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    await app.inject({ method: 'POST', url: '/test/panic' });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('smtp fail'));
    warnSpy.mockRestore();
  });
});

