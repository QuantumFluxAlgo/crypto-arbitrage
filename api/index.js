// API service entrypoint for Fastify server and route wiring
import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import logger from './services/logger.js';
import * as Sentry from '@sentry/node';
import Redis from 'ioredis';
import { URL } from 'url';
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
import resumeRoutes from './routes/resume.js';
import systemHealthRoutes from './routes/systemHealth.js';
import panicRoutes from './routes/panic.js';
import alertRoutes from './routes/alert.js';
import configRoutes from './routes/config.js';
import opportunitiesRoutes from './routes/opportunities.js';
import { getControlChannel } from './config/settings.js';
import { baseOpenPaths } from './lib/constants.js';
import { sendAlert } from '../alerts/alertAgent.js';
import { sendEmail } from '../alerts/emailAlert.js';
import auditLogger, { logReplayCLI } from './middleware/auditLogger.js';
import { start as startWsServer } from './services/wsServer.js';
import { getPauseState, setPauseState } from './services/pauseState.js';
import { redisReachable, fetchBalances } from './services/balances.js';

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
const panicState = { reason: null };

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
      const store = { 'arb:paused_state': 'false' };
      redis = {
        publish: async () => 1,
        get: async key => store[key],
        set: async (key, val) => { store[key] = val; return 'OK'; }
      };
    } else {
      const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
      try {
        const { hostname, port } = new URL(redisUrl);
        redis = new Redis(redisUrl);
        logger.info(`[REDIS] Connected to ${hostname}:${port} via REDIS_URL`);
      } catch (err) {
        logger.error(`[REDIS] Invalid REDIS_URL: ${err.message}`);
      }
    }

    app.register(apiRoutes, { prefix: '/api', redis, pool, panicState });

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
['BINANCE_KEY', 'SMTP_USER', 'SMTP_PASS'].forEach(key => {
  logger.info(`${key} present: ${process.env[key] ? 'true' : 'false'}`);
});

const alertSettings = {
  smtp_user: '',
  smtp_pass: '',
  telegram_token: '',
  webhook_url: '',
};

async function apiRoutes(api, { redis, pool, panicState }) {
  api.register(loginRoute);
  api.register(authRoute);
  api.register(settingsRoutes, { redis });
  api.register(opportunitiesRoutes, { redis });
  api.register(auditLogger, { pool });

  api.addHook('onRequest', async (req, reply) => {
    const openPaths = [
      ...baseOpenPaths,
      ...(process.env.EXECUTION_MODE === 'sandbox' ? ['/api/resume'] : []),
      ...(isTest ? ['/api/test/panic', '/api/test/resume', '/api/test/sweep'] : []),
    ];
    if (openPaths.includes(req.url)) return;
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({ error: 'unauthorized' });
    }
  });

  // Enforce auth on mutating routes
  api.addHook('preHandler', async (req, reply) => {
    if (!['POST', 'PUT', 'DELETE'].includes(req.method)) return;
    const openPaths = [
      ...baseOpenPaths,
      ...(process.env.EXECUTION_MODE === 'sandbox' ? ['/api/resume'] : []),
      ...(isTest ? ['/api/test/panic', '/api/test/resume', '/api/test/sweep'] : []),
    ];
    if (openPaths.includes(req.url)) return;

    const apiKey = req.headers['x-api-key'];
    if (apiKey) {
      if (apiKey !== process.env.API_KEY) {
        logger.warn(`[UNAUTHORIZED] ${req.method} ${req.url} rejected`);
        return reply.code(403).send({ error: 'Unauthorized' });
      }
      req.user = { id: 'api-key' };
      return;
    }

    try {
      await req.jwtVerify();
    } catch {
      logger.warn(`[UNAUTHORIZED] ${req.method} ${req.url} rejected`);
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    if (!req.user || (!req.user.id && !req.user.email)) {
      logger.warn(`[UNAUTHORIZED] ${req.method} ${req.url} rejected`);
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  api.addHook('onError', async (req, reply, error) => {
    Sentry.captureException(error);
  });


  api.get('/alerts', async () => alertSettings);
  api.post('/alerts', async req => {
    Object.assign(alertSettings, req.body);
    return { saved: true };
  });

  api.post('/alerts/test/:type', async (req, reply) => {
    if (process.env.SANDBOX_MODE !== 'true') {
      return reply.code(403).send();
    }
    try {
      await sendAlert(req.params.type, 'Test alert');
      return { sent: true };
    } catch (err) {
      reply.code(500);
      return { error: 'failed' };
    }
  });

  api.get('/alerts/verify', async (req, reply) => {
    if (process.env.SANDBOX_MODE !== 'true') {
      return reply.code(403).send();
    }
    try {
      await sendAlert('email', 'Alert verification');
      req.log.info('SMTP verification sent');
      return { sent: true };
    } catch (err) {
      req.log.error('SMTP verify failed', err);
      reply.code(500);
      return { error: 'failed' };
    }
  });


  api.post('/logout', async (req, reply) => {
    reply.clearCookie('token');
    return { loggedOut: true };
  });


  api.get('/system/status', async () => ({
    paused: await getPauseState(redis),
    panic_reason: panicState.reason,
  }));

  api.register(systemHealthRoutes, { redis, pool });

  api.register(alertRoutes, { redis });

    if (isTest) {
      api.register(panicRoutes, { redis, panicState });
      api.post('/test/resume', async (_req, reply) => {
        if (process.env.SANDBOX_MODE !== 'true') {
          return reply.code(403).send();
        }
        const paused = await getPauseState(redis);
        if (!paused) {
          reply.code(400);
          return { error: 'not paused' };
        }
        await setPauseState(redis, false);
        panicState.reason = null;
        await redis.publish(getControlChannel(), 'resume');
        logger.info('[RESUME] Trading re-enabled by operator');
        return { paused: false, source: 'manual' };
      });

      api.post('/test/sweep', async (_req, reply) => {
        if (process.env.SANDBOX_MODE !== 'true') {
          return reply.code(403).send();
        }

        const timestamp = new Date().toISOString();

        const redisOk = await redisReachable(redis);
        if (!redisOk) {
          logger.error('[SWEEP] Redis unavailable – aborting sweep for safety');
          return { sweepInitiated: false, reason: 'Redis unavailable', timestamp };
        }

        const { balances, complete } = await fetchBalances(pool, redis);
        const assetCount = balances.length;
        const total = balances.reduce((sum, b) => sum + (b.usd_value || 0), 0);
        const totalStr = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        logger.info(`[SWEEP] Simulated sweep of ${assetCount} assets totaling $${totalStr} (dry-run only)`);
        if (!complete) {
          logger.warn('[SWEEP WARNING] Balance source incomplete – operator review recommended');
        }

        await redis.publish(getControlChannel(), 'sweep');
        return { sweepInitiated: true, timestamp };
      });
    }

  api.register(userRoutes, { prefix: '/users' });
  api.register(infraRoutes, { redis, pool });
  api.register(modelRoutes, { pool });
  api.register(configRoutes);
  api.register(resumeRoutes, { redis, panicState });
  api.register(metricsRoutes, { redis });
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
export { buildApp, logReplayCLI };
