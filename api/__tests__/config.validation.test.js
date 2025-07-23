import request from 'supertest';

const describeLocal =
  process.env.TEST_ENV === 'local' || !process.env.TEST_ENV
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

describeLocal('config validation', () => {
  test('rejects unsafe maxLoss', async () => {
    const res = await request(app.server)
      .post('/api/config')
      .set('Cookie', cookie)
      .send({ maxLoss: 99 });
    expect(res.statusCode).toBe(400);
  });

  test('rejects unsafe maxLatency', async () => {
    const res = await request(app.server)
      .post('/api/config')
      .set('Cookie', cookie)
      .send({ maxLatency: 6000 });
    expect(res.statusCode).toBe(400);
  });

  test('accepts valid payload', async () => {
    const res = await request(app.server)
      .post('/api/config')
      .set('Cookie', cookie)
      .send({ maxLoss: 5, maxLatency: 1000 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ saved: true });
  });
});
