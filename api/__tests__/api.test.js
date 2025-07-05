import request from 'supertest';
process.env.NODE_ENV = 'test';
import app from '../index.js';

describe('API authentication', () => {
    test('/login returns a cookie', async () => {
        const res = await request('http://localhost:8080').post('/api/login').send({
            email: 'user',
            password: 'pass'
        });
        expect(res.statusCode).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();
    });
    
    test('/login rejects invalid credentials', async () => {
        const res = await request('http://localhost:8080').post('/api/login').send({
            email: 'user',
            password: 'wrong'
        });
        expect(res.statusCode).toBe(401);
    });
    
    test('/opportunities requires auth', async () => {
        const unauth = await request('http://localhost:8080').get('/opportunities');
        expect(unauth.statusCode).toBe(401);
        
        const login = await request('http://localhost:8080')
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
        const cookie = login.headers['set-cookie'][0].split(';')[0];
        const authRes = await request('http://localhost:8080')
        .get('/opportunities')
        .set('Cookie', cookie);
        expect(authRes.statusCode).toBe(200);
    });
    
    test('/resume requires auth', async () => {
      const res = await request('http://localhost:8080').post('/resume');
      expect(res.statusCode).toBe(401);

      const login = await request('http://localhost:8080')
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
      const authRes = await request('http://localhost:8080')
        .post('/resume')
        .set('Cookie', cookie);
      expect(authRes.statusCode).toBe(200);
    });

    test('GET /settings returns empty object', async () => {
      const login = await request('http://localhost:8080')
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
      const res = await request('http://localhost:8080')
        .get('/settings')
        .set('Cookie', cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({});
    });

    test('POST /settings saves settings', async () => {
      const login = await request('http://localhost:8080')
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
      const res = await request('http://localhost:8080')
        .post('/settings')
        .set('Cookie', cookie)
        .send({ maxLoss: 0.1 });
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ saved: true });
    });

    test('/resume requires auth', async () => {
      const res = await request('http://localhost:8080').post('/resume');
      expect(res.statusCode).toBe(401);
    });
    

    test('/resume publishes message', async () => {
      const login = await request('http://localhost:8080')
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
      const res = await request('http://localhost:8080')
        .post('/resume')
        .set('Cookie', cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ resumed: true });
    });
    
    test('/logout clears cookie', async () => {
      const login = await request('http://localhost:8080')
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
      const res = await request('http://localhost:8080')
        .post('/logout')
        .set('Cookie', cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ loggedOut: true });
    });
    
    test('/trades/history requires auth', async () => {
        const unauth = await request('http://localhost:8080').get('/trades/history');
        expect(unauth.statusCode).toBe(401);
        
        const login = await request('http://localhost:8080')
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
        const cookie = login.headers['set-cookie'][0].split(';')[0];
        const res = await request('http://localhost:8080')
        .get('/trades/history')
        .set('Cookie', cookie);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /alerts/test/email returns 200', async () => {
      const login = await request('http://localhost:8080')
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
      const res = await request('http://localhost:8080')
        .post('/alerts/test/email')
        .set('Cookie', cookie);
      expect(res.statusCode).toBe(200);
    });

    test('/infra/status returns infra summary', async () => {
      const login = await request('http://localhost:8080')
        .post('/api/login')
        .send({ email: 'user', password: 'pass' });
      const cookie = login.headers['set-cookie'][0].split(';')[0];
      const res = await request('http://localhost:8080')
        .get('/infra/status')
        .set('Cookie', cookie);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('pods');
      expect(Array.isArray(res.body.pods)).toBe(true);
    });
});

  afterAll(async () => {
    await app.close();
  });

