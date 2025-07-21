import request from 'supertest';
import { jest } from '@jest/globals';
import logger from '../services/logger.js';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
let buildApp;
let app;
let warnSpy;

beforeAll(async () => {
  ({ buildApp } = await import('../index.js'));
  app = buildApp();
  await app.listen({ port: 0 });
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
  process.env.EXECUTION_MODE = 'live';
});

afterEach(() => {
  warnSpy.mockRestore();
});

describeLocal('resume endpoint auth', () => {
  test('200 with admin token', async () => {
    const token = app.jwt.sign({ role: 'admin' }, { algorithm: 'HS256' });
    const res = await request(app.server)
      .post('/api/resume')
      .set('Cookie', `token=${token}`);
    expect(res.statusCode).toBe(200);
  });

  test('401 without token in live mode', async () => {
    const res = await request(app.server).post('/api/resume');
    expect(res.statusCode).toBe(401);
  });

  test('logs rejection for non-admin', async () => {
    const token = app.jwt.sign({ role: 'user' }, { algorithm: 'HS256' });
    const res = await request(app.server)
      .post('/api/resume')
      .set('Cookie', `token=${token}`);
    expect(res.statusCode).toBe(401);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[RESUME-BLOCKED]'));
  });

  test('200 in sandbox without token', async () => {
    process.env.EXECUTION_MODE = 'sandbox';
    const res = await request(app.server).post('/api/resume');
    expect(res.statusCode).toBe(200);
  });
});
