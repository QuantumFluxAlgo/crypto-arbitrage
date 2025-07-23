import request from 'supertest';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
let buildApp;
let app;
let cookie;

beforeAll(async () => {
  ({ buildApp } = await import('../index.js'));
  app = buildApp();
  await app.listen({ port: 0 });
  const login = await request(app.server)
    .post('/api/login')
    .send({ email: 'user', password: 'pass' });
  cookie = login.headers['set-cookie'][0].split(';')[0];
});

afterAll(async () => {
  await app.close();
});

describeLocal('alert panic endpoint', () => {
  test('requires auth', async () => {
    const res = await request(app.server).post('/api/alert/panic');
    expect(res.statusCode).toBe(401);
  });

  test('triggers pause with source', async () => {
    const res = await request(app.server)
      .post('/api/alert/panic')
      .set('Cookie', cookie)
      .send({ source: 'trading-bot-1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.paused).toBe(true);
    expect(res.body.triggeredBy).toBe('trading-bot-1');
    expect(res.body).toHaveProperty('timestamp');
  });
});
