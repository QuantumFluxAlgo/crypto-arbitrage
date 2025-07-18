import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import winston from 'winston';
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

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

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

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});
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

  api.addHook('onRequest', async (req, reply) => {
    const openPaths = [
      '/api/login',
      '/login',
      '/api/reset-password',
      '/reset-password',
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
        return { triggered: true };
      });

      api.post('/test/resume', async () => {
        testState.panic = false;
        return { resumed: true };
      });

      api.post('/test/sweep', async () => {
        app.log.info('[DRY-RUN MODE] Cold wallet sweep logic verified. No assets moved.');
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
