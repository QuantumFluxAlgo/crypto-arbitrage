import request from 'supertest';
process.env.NODE_ENV = 'test';
process.env.ADMIN_TOKEN = 'testadmintoken';
process.env.SANDBOX_MODE = 'true';
import { buildApp } from '../index.js';
let app;

beforeAll(async () => {
  app = buildApp();
  await app.listen({ port: 8080 });
});

describe('API authentication', () => {
  test('/login returns a cookie', async () => {
    const res = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('/login rejects invalid credentials', async () => {
    const res = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'wrong' });
    expect(res.statusCode).toBe(401);
  });
    
  test('sandbox login works with demo credentials', async () => {
    const res = await request(app.server)
      .post('/api/login')
      .send({ email: 'demo@prismarbitrage.ai', password: 'demo1234' });
     expect(res.statusCode).toBe(200);
     expect(res.body).toEqual({ token: 'demo-token' });
    });

  test('/opportunities requires auth', async () => {
    const unauth = await request(app.server).get('/api/opportunities');
    expect(unauth.statusCode).toBe(401);

    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const authRes = await request(app.server)
      .get('/api/opportunities')
      .set('Cookie', cookie);
    expect(authRes.statusCode).toBe(200);
  });

  test('/resume requires auth and publishes message', async () => {
    const res = await request(app.server).post('/api/resume');
    expect(res.statusCode).toBe(401);

    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const authRes = await request(app.server)
      .post('/api/resume')
      .set('Cookie', cookie);
    expect(authRes.statusCode).toBe(200);
    expect(authRes.body).toEqual({ resumed: true });
  });

  test('GET /settings returns expected settings', async () => {
    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app.server)
      .get('/api/settings')
      .set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.any(Object));
  });

  test('PATCH /settings saves settings', async () => {
    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app.server)
      .patch('/api/settings')
      .set('Cookie', cookie)
      .send({ maxLoss: 0.1 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ saved: true });
  });

  test('POST /settings saves settings (legacy)', async () => {
    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app.server)
      .post('/api/settings')
      .set('Cookie', cookie)
      .send({ canary_mode: true });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ saved: true });
  });

    test('PATCH /settings toggles ghost mode', async () => {
      const login = await request(app.server)
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
      const res = await request(app.server)
        .patch('/api/settings')
        .set('Cookie', cookie)
        .send({ ghost_mode: true });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ saved: true });
    });

    test('PATCH /settings does not override sandbox env', async () => {
      const login = await request(app.server)
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
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

  test('/logout clears cookie', async () => {
    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app.server)
      .post('/api/logout')
      .set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ loggedOut: true });
  });

  test('/trades/history requires auth', async () => {
    const unauth = await request(app.server).get('/api/trades/history');
    expect(unauth.statusCode).toBe(401);

    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app.server)
      .get('/api/trades/history')
      .set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

    test('/infra/status returns fake data in sandbox mode', async () => {
      process.env.SANDBOX_MODE = 'true';
      const login = await request(app.server)
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
      const res = await request(app.server)
        .get('/api/infra/status')
        .set('Cookie', cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body.gpu).toBe(72);
      expect(res.body.db).toBe(true);
      expect(res.body.redis).toBe(true);
      expect(res.body.pods.length).toBe(5);
      delete process.env.SANDBOX_MODE;
    });

  test('POST /alerts/test/email returns 200', async () => {
    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app.server)
      .post('/api/alerts/test/email')
      .set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
  });

  test('/infra/status returns infra summary', async () => {
    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app.server)
      .get('/api/infra/status')
      .set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('pods');
    expect(Array.isArray(res.body.pods)).toBe(true);
  });

  test('/change-password updates stored password', async () => {
    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app.server)
      .post('/api/change-password')
      .set('Cookie', cookie)
      .send({ oldPassword: 'pass', newPassword: 'newpass' });
    expect(res.statusCode).toBe(200);

    const relog = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'newpass' });
    expect(relog.statusCode).toBe(200);
  });

  test('/reset-password requires admin token', async () => {
    const res = await request(app.server)
      .post('/api/reset-password')
      .send({ email: 'user', newPassword: 'reset' });
    expect(res.statusCode).toBe(401);
  });

  test('/reset-password resets user password with admin token', async () => {
    const res = await request(app.server)
      .post('/api/reset-password')
      .set('x-admin-token', 'testadmintoken')
      .send({ email: 'user', newPassword: 'resetpass' });
    expect(res.statusCode).toBe(200);

    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'resetpass' });
    expect(login.statusCode).toBe(200);
  });

  test('/api/users requires admin', async () => {
    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'user', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app.server)
      .get('/api/users')
      .set('Cookie', cookie);
    expect(res.statusCode).toBe(403);
  });

  test('admin can manage users', async () => {
    const login = await request(app.server)
      .post('/api/login')
      .send({ email: 'admin', password: 'pass' });
    const cookie = login.headers['set-cookie'][0].split(';')[0];

    const create = await request(app.server)
      .post('/api/users')
      .set('Cookie', cookie)
      .send({ email: 'new', password: 'secret' });
    expect(create.statusCode).toBe(200);
    const userId = create.body.id;

    const list = await request(app.server)
      .get('/api/users')
      .set('Cookie', cookie);
    expect(list.statusCode).toBe(200);
    expect(list.body.find(u => u.id === userId).email).toBe('new');

    const update = await request(app.server)
      .put(`/api/users/${userId}`)
      .set('Cookie', cookie)
      .send({ password: 'changed' });
    expect(update.statusCode).toBe(200);

    const del = await request(app.server)
      .delete(`/api/users/${userId}`)
      .set('Cookie', cookie);
    expect(del.statusCode).toBe(200);
  });
});

afterAll(async () => {
  await app.close();
});
