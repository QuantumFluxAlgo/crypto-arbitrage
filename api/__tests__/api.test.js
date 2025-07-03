import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import supertest from 'supertest';
import appModule from '../index.js';

let app;

beforeAll(async () => {
  app = Fastify();
  app.register(fastifyCookie);
  app.register(fastifyJwt, { secret: 'test' });
  app.register(appModule);
  await app.ready();
});

afterAll(() => app.close());

test('login issues token and protects opportunities', async () => {
  const loginRes = await supertest(app.server)
    .post('/login')
    .send({ email: 'a', password: 'b' })
    .expect(200);

  const cookie = loginRes.headers['set-cookie'][0];
  await supertest(app.server)
    .get('/opportunities')
    .set('Cookie', cookie)
    .expect(200);

    await supertest(app.server)
      .get('/opportunities')
      .expect(401);
});
