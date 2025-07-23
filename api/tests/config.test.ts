import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';
process.env.SANDBOX_MODE = 'true';

let buildApp: any;
let app: any;
let cookie: string;

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

test('rejects invalid config values', async () => {
  const res1 = await request(app.server)
    .post('/api/config')
    .set('Cookie', cookie)
    .send({ maxLoss: 20 });
  expect(res1.statusCode).toBe(400);

  const res2 = await request(app.server)
    .post('/api/config')
    .set('Cookie', cookie)
    .send({ maxLatency: 100 });
  expect(res2.statusCode).toBe(400);

  const res3 = await request(app.server)
    .post('/api/config')
    .set('Cookie', cookie)
    .send({ maxLatency: 5000 });
  expect(res3.statusCode).toBe(400);
});

 test('accepts valid config values', async () => {
  const res = await request(app.server)
    .post('/api/config')
    .set('Cookie', cookie)
    .send({ maxLoss: 10, maxLatency: 500 });
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ saved: true });
});

