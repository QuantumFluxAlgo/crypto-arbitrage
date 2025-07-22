import request from 'supertest';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';
let buildApp;
let testState;
let app;

beforeAll(async () => {
  ({ buildApp, testState } = await import('../index.js'));
  app = buildApp();
  await app.listen({ port: 0 });
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
    expect(testState.paused).toBe(true);

    const metrics1 = await request(app.server).get('/api/metrics/sandbox');
    expect(metrics1.body.panicActive).toBe(true);

    const resumeRes = await request(app.server).post('/api/test/resume');
    expect(resumeRes.statusCode).toBe(200);
    expect(testState.paused).toBe(false);

    const metrics2 = await request(app.server).get('/api/metrics/sandbox');
    expect(metrics2.body.panicActive).toBe(false);
  });
});

