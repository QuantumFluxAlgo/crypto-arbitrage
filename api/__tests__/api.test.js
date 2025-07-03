const request = require('supertest');
const app = require('../index');

describe('API authentication', () => {
  test('/login returns a token', async () => {
    const res = await request(app).post('/login').send({
      username: 'user',
      password: 'pass'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('/opportunities requires auth', async () => {
    const unauth = await request(app).get('/opportunities');
    expect(unauth.statusCode).toBe(401);

    const login = await request(app).post('/login');
    const token = login.body.token;
    const authRes = await request(app)
      .get('/opportunities')
      .set('Authorization', `Bearer ${token}`);
    expect(authRes.statusCode).toBe(200);
  });
});
