const request = require('supertest');
const app = require('../index');

describe('API authentication', () => {
  test('/login returns a cookie', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'user', password: 'pass' });

      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    test('/opportunities requires auth', async () => {
      const unauth = await request(app).get('/opportunities');
      expect(unauth.statusCode).toBe(401);

        const login = await request(app)
          .post('/login')
          .send({ email: 'user', password: 'pass' });

        const cookie = login.headers['set-cookie'][0];
        const authRes = await request(app)
      .get('/opportunities')
        .set('Cookie', cookie);

      expect(authRes.statusCode).toBe(200);
    });
});
