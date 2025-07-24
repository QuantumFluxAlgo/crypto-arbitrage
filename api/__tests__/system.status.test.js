import request from 'supertest';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV
  ? describe
  : describe.skip;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';
let buildApp;
let app;
let cookie;

beforeAll(async () => {
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
});

describeLocal('system status endpoint', () => {
  test('reports paused state and reason', async () => {
    await request(app.server).post('/api/test/panic').send({ type: 'loss' });
    const res = await request(app.server)
      .get('/api/system/status')
      .set('Cookie', cookie);
    expect(res.body.paused).toBe(true);
    expect(res.body.redisHealthy).toBe(true);

    await request(app.server).post('/api/test/resume');
    const res2 = await request(app.server)
      .get('/api/system/status')
      .set('Cookie', cookie);
    expect(res2.body.paused).toBe(false);
    expect(Array.isArray(res2.body.warnings)).toBe(true);
  });
});
