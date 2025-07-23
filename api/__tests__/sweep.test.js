import request from 'supertest';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
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

describeLocal('cold sweep dry run', () => {
  test('POST /api/test/sweep returns summary', async () => {
    const res = await request(app.server)
      .post('/api/test/sweep')
      .set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('dry-run-complete');
    expect(typeof res.body.triggered).toBe('boolean');
    expect(Array.isArray(res.body.actions)).toBe(true);
  });
});
