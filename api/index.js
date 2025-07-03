const Fastify = require('fastify');
const fastifyJwt = require('@fastify/jwt');
const fastifyCookie = require('@fastify/cookie');
const winston = require('winston');
const { sendAlert } = require('./services/alertManager');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

const app = Fastify();
app.register(fastifyCookie);
app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'test-secret' });

/**
 * Auth endpoint
 */
app.post('/login', async (req, reply) => {
  const { email, password } = req.body || {};

  // TODO: Replace with real auth
  if (email && password) {
    const token = app.jwt.sign({ email });
    reply.setCookie('token', token, { httpOnly: true });
    logger.info(`User logged in: ${email}`);
    return { ok: true };
  }

  await sendAlert('email', `Failed login attempt for ${email || 'unknown user'}`);
  logger.warn(`Login failed for ${email}`);
  reply.code(401).send({ error: 'invalid credentials' });
});

/**
 * Global auth hook
 */
app.addHook('onRequest', async (req, reply) => {
  if (req.url === '/login') return;

  try {
    const token = req.cookies.token;
    await req.jwtVerify({ token });
  } catch (err) {
    await sendAlert('telegram', `Unauthorized request to ${req.url}`);
    logger.warn(`Unauthorized access to ${req.url}`);
    reply.code(401).send({ error: 'unauthorized' });
  }
});

/**
 * Protected routes
 */
app.get('/opportunities', async () => {
  return { items: [] };
});

app.get('/settings', async () => {
  return {};
});

app.post('/settings', async (req) => {
  return { saved: true };
});

app.get('/metrics', async () => {
  return { status: 'ok' };
});

/**
 * Start server
 */
const PORT = process.env.PORT || 8080;
app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  logger.info(`API service started on port ${PORT}`);
});

module.exports = app;

