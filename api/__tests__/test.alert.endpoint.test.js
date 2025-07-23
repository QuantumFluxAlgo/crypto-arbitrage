import request from 'supertest';

const describeLocal = process.env.TEST_ENV === 'local' || !process.env.TEST_ENV ? describe : describe.skip;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';
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

describeLocal('test alert endpoint', () => {
  test('sends dummy alert', async () => {
    const res = await request(app.server).post('/api/test/alert');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('sent');
    expect(res.body.type).toBe('test');
    expect(res.body).toHaveProperty('ts');
  });
});
