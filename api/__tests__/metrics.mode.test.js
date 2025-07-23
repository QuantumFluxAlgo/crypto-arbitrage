import request from 'supertest';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';

let buildApp;
let app;

beforeAll(async () => {
  ({ buildApp } = await import('../index.js'));
  app = await buildApp();
  await app.listen({ port: 0 });
});

afterAll(async () => {
  await app.close();
});

describeLocal('mode specific metrics endpoints', () => {
  test('live metrics endpoint returns data', async () => {
    const res = await request(app.server).get('/api/metrics/live');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('equityCurve');
  });

  test('sandbox metrics endpoint returns data', async () => {
    const res = await request(app.server).get('/api/metrics/sandbox');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('latency');
  });

  test('deprecated metrics endpoint returns 404', async () => {
    const res = await request(app.server).get('/api/metrics');
    expect(res.statusCode).toBe(404);
  });
});
