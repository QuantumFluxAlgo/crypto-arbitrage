import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import winston from 'winston';
import * as Sentry from '@sentry/node';
import Redis from 'ioredis';
import pg from 'pg';
import loginRoute from './routes/login.js';
import { sendAlert } from './services/alertManager.js';
import infraRoutes from './routes/infra.js';
const { Pool } = pg;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production'
});

const app = Fastify();
app.register(fastifyCookie);
app.register(fastifyJwt, { secret: process.env.JWT_SECRET || 'change-me' });

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'arbdb',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || ''
});

let redis;
if (process.env.NODE_ENV === 'test') {
  redis = { publish: async () => 1 };
} else {
  redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  });
}

const alertSettings = {
  smtp_user: '',
  smtp_pass: '',
  telegram_token: '',
  webhook_url: ''
};

app.register(loginRoute);

app.addHook('onRequest', async (req, reply) => {
    if (req.url === '/login') return;
  try {
    const token = req.cookies.token;
    await app.jwt.verify(token);
  } catch {
    reply.code(401).send({ error: 'unauthorized' });
  }
});

app.addHook('onError', async (req, reply, error) => {
  Sentry.captureException(error);
});

app.get('/opportunities', async () => []);
app.get('/settings', async () => ({}));
app.post('/settings', async req => ({ saved: true }));

app.get('/alerts', async () => alertSettings);
app.post('/alerts', async req => {
  Object.assign(alertSettings, req.body);
  return { saved: true };
});

app.post('/alerts/test/:type', async (req, reply) => {
  try {
    await sendAlert(req.params.type, 'Test alert');
    return { sent: true };
  } catch (err) {
    reply.code(500);
    return { error: 'failed' };
  }
});
app.get('/trades/history', async (req, reply) => {
  try {
    const { rows } = await pool.query(
      'SELECT pair, pnl, timestamp FROM trades ORDER BY timestamp DESC LIMIT 50'
    );
    return rows.map(row => ({
      pair: row.pair,
      PnL: row.pnl,
      timestamp: row.timestamp
    }));
  } catch (err) {
    req.log.error(err);
    return [];
  }
});
app.get('/metrics', async () => ({ status: 'ok' }));
app.post('/logout', async (req, reply) => {
  reply.clearCookie('token');
  return { loggedOut: true };
});
app.post('/resume', async () => {
  await redis.publish('control-feed', 'resume');
  return { resumed: true };
});

app.register(infraRoutes, { redis, pool });

app.listen({ port: 8080, host: '0.0.0.0' }, err => {
    
  if (err) { logger.error(err); process.exit(1); }
  logger.info('API service started');
});

export default app;
