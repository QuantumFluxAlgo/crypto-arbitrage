import request from 'supertest';
process.env.NODE_ENV = 'test';
process.env.SANDBOX_MODE = 'true';
let buildApp;
let app;
let cookie;

beforeAll(async () => {
  ({ buildApp } = await import('../index.js'));
  app = buildApp();
  await app.listen({ port: 0 });
  const login = await request(app.server)
    .post('/api/login')
    .send({ email: 'user', password: 'pass' });
  cookie = login.headers['set-cookie'][0].split(';')[0];
});

afterAll(async () => {
  await app.close();
});

describe('settings validation', () => {
  test('rejects unknown properties', async () => {
    const res = await request(app.server)
      .patch('/api/settings')
      .set('Cookie', cookie)
      .send({ evil: true });
    expect(res.statusCode).toBe(400);
  });

  test('rejects incorrect types', async () => {
    const res = await request(app.server)
      .patch('/api/settings')
      .set('Cookie', cookie)
      .send({ ghost_mode: 'true' });
    expect(res.statusCode).toBe(400);
  });

  test('ignores invalid sweep_cadence values', async () => {
    const res = await request(app.server)
      .patch('/api/settings')
      .set('Cookie', cookie)
      .send({ sweep_cadence: 'Weekly' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ saved: true });

    const verify = await request(app.server)
      .get('/api/settings')
      .set('Cookie', cookie);
    expect(verify.body.sweep_cadence).toBe('None');
  });

  test('forced sandbox_mode cannot be disabled', async () => {
    const res = await request(app.server)
      .patch('/api/settings')
      .set('Cookie', cookie)
      .send({ sandbox_mode: false });
    expect(res.statusCode).toBe(200);

    const verify = await request(app.server)
      .get('/api/settings')
      .set('Cookie', cookie);
    expect(verify.body.sandbox_mode).toBe(true);
  });
});

