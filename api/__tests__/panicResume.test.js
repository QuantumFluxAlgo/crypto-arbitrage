import request from 'supertest';
process.env.NODE_ENV = 'test';
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

test('panic and resume cycle updates metrics', async () => {
  const panicRes = await request(app.server).post('/api/test/panic');
  expect(panicRes.statusCode).toBe(200);
  expect(testState.panic).toBe(true);

  const metrics1 = await request(app.server).get('/api/metrics');
  expect(metrics1.body.panicActive).toBe(true);

  const resumeRes = await request(app.server).post('/api/resume');
  expect(resumeRes.statusCode).toBe(200);
  expect(testState.panic).toBe(false);

  const metrics2 = await request(app.server).get('/api/metrics');
  expect(metrics2.body.panicActive).toBe(false);
});

