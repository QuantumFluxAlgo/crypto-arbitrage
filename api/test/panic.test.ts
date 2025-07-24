import request from 'supertest';
import { jest } from '@jest/globals';
import logger from '../services/logger.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';

let buildApp: any;
let app: any;
let infoSpy: jest.SpiedFunction<typeof logger.info>;
let warnSpy: jest.SpiedFunction<typeof logger.warn>;
let cookie: string;

beforeAll(async () => {
  infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
  warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
  ({ buildApp } = await import('../index.js'));
  app = await buildApp();
  await app.listen({ port: 0 });
  const login = await request(app.server)
    .post('/api/login')
    .send({ email: 'user', password: 'pass' });
  cookie = login.headers['set-cookie'][0].split(';')[0];
});

afterAll(async () => {
  await app.close();
  infoSpy.mockRestore();
  warnSpy.mockRestore();
});

beforeEach(() => {
  infoSpy.mockClear();
  warnSpy.mockClear();
});

test('panic endpoint sets paused state', async () => {
  const res = await request(app.server).post('/api/test/panic');
  expect(res.statusCode).toBe(200);
  expect(res.body.paused).toBe(true);
  expect(res.body.status).toBe('panic_triggered');
  const status = await request(app.server)
    .get('/api/system/status')
    .set('Cookie', cookie);
  expect(status.body.paused).toBe(true);
  expect(warnSpy).toHaveBeenCalled();
});

test('second panic call is ignored', async () => {
  await request(app.server).post('/api/test/panic');
  const res = await request(app.server).post('/api/test/panic');
  expect(res.body.message).toBe('Already paused');
  expect(infoSpy).toHaveBeenCalled();
});

test('redis flag set to true', async () => {
  await request(app.server).post('/api/test/panic');
  const status = await request(app.server)
    .get('/api/system/status')
    .set('Cookie', cookie);
  expect(status.body.paused).toBe(true);
});
