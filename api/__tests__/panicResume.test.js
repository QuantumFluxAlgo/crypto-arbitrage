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

describeLocal('panic resume cycle', () => {
  test('panic and resume cycle updates metrics', async () => {
    const panicRes = await request(app.server)
      .post('/api/test/panic')
      .send({ type: 'loss' });
    expect(panicRes.statusCode).toBe(200);
    const status1 = await request(app.server)
      .get('/api/system/status')
      .set('Cookie', cookie);
    expect(status1.body.paused).toBe(true);

    const metrics1 = await request(app.server).get('/api/metrics/sandbox');
    expect(metrics1.body.panicActive).toBe(true);

    const resumeRes = await request(app.server).post('/api/test/resume');
    expect(resumeRes.statusCode).toBe(200);
    const status2 = await request(app.server)
      .get('/api/system/status')
      .set('Cookie', cookie);
    expect(status2.body.paused).toBe(false);

    const metrics2 = await request(app.server).get('/api/metrics/sandbox');
    expect(metrics2.body.panicActive).toBe(false);
  });

  test('panic trigger debounced', async () => {
    await request(app.server).post('/api/test/panic').send({ type: 'loss' });
    const res = await request(app.server).post('/api/test/panic').send({ type: 'loss' });
    expect(res.body.ignored).toBe(true);
  });
});

