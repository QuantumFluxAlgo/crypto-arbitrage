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

test('cold sweep dry-run endpoint', async () => {
  const res = await request(app.server).post('/api/test/sweep');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ status: 'dry-run', triggered: true });
});
