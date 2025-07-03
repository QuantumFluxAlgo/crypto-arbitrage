import request from 'supertest';
import app from '../index.js';

describe('API authentication', () => {
    test('/login returns a cookie', async () => {
      const res = await request('http://localhost:8080').post('/login').send({
        email: 'user',
        password: 'pass'
      });
      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie']).toBeDefined();
    });

    test('/opportunities requires auth', async () => {
      const unauth = await request('http://localhost:8080').get('/opportunities');
      expect(unauth.statusCode).toBe(401);

        const login = await request('http://localhost:8080')
          .post('/login')
          .send({ email: 'user', password: 'pass' });
        const cookie = login.headers['set-cookie'][0].split(';')[0];
        const authRes = await request('http://localhost:8080')
        .get('/opportunities')
        .set('Cookie', cookie);
      expect(authRes.statusCode).toBe(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });

