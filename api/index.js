const Fastify = require('fastify');
const fastifyJwt = require('@fastify/jwt');
const fastifyCookie = require('@fastify/cookie');
const winston = require('winston');
const { sendAlert } = require('./services/alertManager');

const app = Fastify();
app.register(fastifyCookie);
app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'change-me' });

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

app.post('/login', async (req, reply) => {
  const { email, password } = req.body || {};
  // TODO: replace with real auth check
  if (email && password) {
    const token = app.jwt.sign({ email });
    reply.setCookie('token', token, { httpOnly: true });
    return { ok: true };
  }
  await sendAlert('email', `Failed login attempt for ${email || 'unknown user'}`);
  reply.code(401).send({ error: 'invalid credentials' });
});

app.addHook('onRequest', async (req, reply) => {
  if (req.url === '/login') return;
  try {
    const token = req.cookies.token;
    await req.jwtVerify({ token });
  } catch (err) {
    await sendAlert('telegram', `Unauthorized request to ${req.url}`);
    reply.code(401).send({ error: 'unauthorized' });
  }
});

app.get('/opportunities', async () => []);
app.get('/settings', async () => ({}));
app.post('/settings', async req => ({ saved: true }));
app.get('/metrics', async () => ({ status: 'ok' }));

app.listen({ port: 8080, host: '0.0.0.0' }, err => {
  if (err) { logger.error(err); process.exit(1); }
  logger.info('API service started');
});
