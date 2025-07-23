import request from 'supertest';
import { jest } from '@jest/globals';
import logger from '../services/logger.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';

let buildApp: any;
let app: any;
let cookie: string;
let infoSpy: jest.SpiedFunction<typeof logger.info>;
let warnSpy: jest.SpiedFunction<typeof logger.warn>;

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

test('accepts safe MAX_LOSS_PCT', async () => {
  const res = await request(app.server)
    .patch('/api/settings')
    .set('Cookie', cookie)
    .send({ maxLossPct: 10 });
  expect(res.statusCode).toBe(200);
  expect(infoSpy).not.toHaveBeenCalled();
  expect(warnSpy).not.toHaveBeenCalled();
});

test('rejects unsafe MAX_LOSS_PCT', async () => {
  const res = await request(app.server)
    .patch('/api/settings')
    .set('Cookie', cookie)
    .send({ maxLossPct: 99 });
  expect(res.statusCode).toBe(400);
  expect(warnSpy).toHaveBeenCalled();
});

test('writes override log', async () => {
  await request(app.server)
    .patch('/api/settings')
    .set('Cookie', cookie)
    .send({ maxLossPct: 10 });
  expect(warnSpy).not.toHaveBeenCalled();
});
