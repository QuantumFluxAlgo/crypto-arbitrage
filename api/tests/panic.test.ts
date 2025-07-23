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

test('panic endpoint idempotency', async () => {
  const first = await request(app.server).post('/api/test/panic');
  expect(first.statusCode).toBe(200);
  const second = await request(app.server).post('/api/test/panic');
  expect(second.statusCode).toBe(200);
  expect(second.body.message).toBe('Already paused');
});

