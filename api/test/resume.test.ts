import request from 'supertest';
import { jest } from '@jest/globals';
import logger from '../services/logger.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';

jest.setTimeout(10000);

let buildApp: any;
let app: any;
let infoSpy: jest.SpiedFunction<typeof logger.info>;
let cookie: string;

beforeAll(async () => {
  infoSpy = jest.spyOn(logger, 'info').mockImplementation(() => {});
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
});

beforeEach(() => {
  infoSpy.mockClear();
});

test('resume only works when paused', async () => {
  await request(app.server).post('/api/test/panic');
  const res = await request(app.server).post('/api/test/resume');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ resumed: true, wasPaused: true });
  const status = await request(app.server)
    .get('/api/system/status')
    .set('Cookie', cookie);
  expect(status.body.paused).toBe(false);
  expect(infoSpy).toHaveBeenCalled();
});

test('resume fails when not paused', async () => {
  const res = await request(app.server).post('/api/test/resume');
  expect(res.statusCode).toBe(400);
});

test('resume clears redis flag', async () => {
  await request(app.server).post('/api/test/panic');
  await request(app.server).post('/api/test/resume');
  const status = await request(app.server)
    .get('/api/system/status')
    .set('Cookie', cookie);
  expect(status.body.paused).toBe(false);
});
