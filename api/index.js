// API service entrypoint for Fastify server and route wiring
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import logger from './services/logger.js';
import * as Sentry from '@sentry/node';
import Redis from 'ioredis';
import pg from 'pg';

import loginRoute from './routes/login.js';
import authRoute from './routes/auth.js';
import userRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import infraRoutes from './routes/infra.js';
import modelRoutes from './routes/models.js';
import metricsRoutes from './routes/metrics.js';
import analyticsRoutes from './routes/analytics.js';
import cgtRoutes from './routes/cgt.js';
import { sendAlert } from './services/alertManager.js';
import auditLogger, { logReplayCLI } from './middleware/auditLogger.js';
import { start as startWsServer } from './services/wsServer.js';

const { Pool } = pg;
// Hard stop if credentials or mode are misconfigured

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });

  const jwt = process.env.JWT_SECRET;
  const admin = process.env.ADMIN_TOKEN;
  if (!jwt || jwt === 'change-me' || !admin || admin === 'admin-secret') {
    console.error('JWT_SECRET and ADMIN_TOKEN must be set in production');
    process.exit(1);
  }
  if (process.env.SANDBOX_MODE === 'true') {
    console.error('SANDBOX_MODE must be disabled in production');
    process.exit(1);
  }
}
// Test mode disables external side effects

const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID;
const testState = { panic: false, reason: '' };

let redis;
let pool;

function buildApp() {
  const app = Fastify();
  app.register(fastifyCookie);
  app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'change-me',
    cookie: { cookieName: 'token' }
  });
    // Postgres connection via env vars for local or prod

    pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      database: process.env.PGDATABASE || 'arbdb',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
    });

    if (isTest) {
      redis = { publish: async () => 1 };
    } else {
      // Redis connection parameters via env vars
      redis = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
      });
    }

    app.register(apiRoutes, { prefix: '/api', testState, redis, pool });

    // Ensure external connections close gracefully when the server shuts down
    app.addHook('onClose', async () => {
      await pool.end();
      if (redis && typeof redis.quit === 'function') {
        await redis.quit();
      }
    });

  return app;
}

const app = buildApp();

logger.info('API initialized');

const alertSettings = {
  smtp_user: '',
  smtp_pass: '',
  telegram_token: '',
  webhook_url: '',
};

async function apiRoutes(api, { testState, redis, pool }) {  api.register(loginRoute);
  api.register(authRoute);
  api.register(settingsRoutes, { redis });
  api.register(auditLogger, { pool });

    // Routes allowed without JWT
  api.addHook('onRequest', async (req, reply) => {
    const openPaths = [
      '/api/login',
      '/login',
      '/api/reset-password',
      '/reset-password',
      '/api/metrics/live',
      '/api/metrics/sandbox',
      '/api/metrics',
      ...(process.env.SANDBOX_MODE !== 'true' ? ['/api/resume'] : []),
      ...(isTest ? ['/api/test/panic', '/api/test/resume', '/api/test/sweep'] : []),
    ];
    if (openPaths.includes(req.url)) return;
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'unauthorized' });
    }
  });

  api.addHook('onError', async (req, reply, error) => {
    Sentry.captureException(error);
  });

  api.get('/opportunities', async () => []);

  api.get('/alerts', async () => alertSettings);
  api.post('/alerts', async req => {
    Object.assign(alertSettings, req.body);
    return { saved: true };
  });

  api.post('/alerts/test/:type', async (req, reply) => {
    try {
      await sendAlert(req.params.type, 'Test alert');
      return { sent: true };
    } catch (err) {
      reply.code(500);
      return { error: 'failed' };
    }
  });


  api.post('/logout', async (req, reply) => {
    reply.clearCookie('token');
    return { loggedOut: true };
  });

  api.post('/resume', async () => {
    if (testState) testState.panic = false;
    await redis.publish('control-feed', 'resume');
    return { resumed: true };
  });

  api.get('/system/status', async () => ({
    panic: testState.panic,
    reason: testState.reason,
  }));

    if (isTest) {
      api.post('/test/panic', async () => {
        testState.panic = true;
        await redis.publish('control-feed', 'halt');
        await sendAlert('email', 'Panic brake triggered (test mode)');
        return { triggered: true };
      });

      api.post('/test/resume', async () => {
        testState.panic = false;
        await redis.publish('control-feed', 'resume');
        return { resumed: true };
      });

      api.post('/test/sweep', async () => {
        logger.info('[DRY-RUN MODE] Cold wallet sweep logic verified. No assets moved.');
        await redis.publish('control-feed', 'sweep');
        return { swept: true };
      });
    }

  api.register(userRoutes, { prefix: '/users' });
  api.register(infraRoutes, { redis, pool });
  api.register(modelRoutes, { pool });
  api.register(metricsRoutes, { testState });
  api.register(analyticsRoutes, { pool });
  api.register(cgtRoutes, { pool });
}

if (!isTest) {
  startWsServer();
  app.listen({ port: 8080, host: '0.0.0.0' }, err => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    logger.info('API service started');
  });
}

export default app;
export { buildApp, logReplayCLI, testState };
