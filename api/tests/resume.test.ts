import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';

let buildApp: any;
let app: any;

beforeAll(async () => {
  ({ buildApp } = await import('../index.js'));
  app = await buildApp();
  await app.listen({ port: 0 });
});

afterAll(async () => {
  await app.close();
});

test('resume endpoint idempotency', async () => {
  // not paused initially
  const res1 = await request(app.server).post('/api/test/resume');
  expect(res1.statusCode).toBe(409);

  await request(app.server).post('/api/test/panic');
  const res2 = await request(app.server).post('/api/test/resume');
  expect(res2.statusCode).toBe(200);

  const res3 = await request(app.server).post('/api/test/resume');
  expect(res3.statusCode).toBe(409);
});

