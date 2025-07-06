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
import settings from './config/settings.js';
import infraRoutes from './routes/infra.js';
import modelRoutes from './routes/models.js';
import metricsRoutes from './routes/metrics.js';
import analyticsRoutes from './routes/analytics.js';
import { sendAlert } from './services/alertManager.js';
import auditLogger, { logReplayCLI } from './middleware/auditLogger.js';
import { start as startWsServer } from './services/wsServer.js';

const { Pool } = pg;

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
});

function buildApp() {
  const app = Fastify();
  settings.sandbox_mode = process.env.SANDBOX_MODE === 'true';
  app.register(fastifyCookie);
    app.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || 'change-me',
      cookie: { cookieName: 'token' }
    });
  app.register(apiRoutes, { prefix: '/api' });
  return app;
}

const app = buildApp();

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()],
});

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'arbdb',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
});

let redis;
if (process.env.NODE_ENV === 'test') {
  redis = { publish: async () => 1 };
} else {
  redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
  });
}

const alertSettings = {
  smtp_user: '',
  smtp_pass: '',
  telegram_token: '',
  webhook_url: '',
};

async function apiRoutes(api) {
  api.register(loginRoute);
  api.register(authRoute);
  api.register(auditLogger, { pool });

  api.addHook('onRequest', async (req, reply) => {
    const openPaths = [
      '/api/login',
      '/login',
      '/api/reset-password',
      '/reset-password',
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

    const updateSettings = body => {
      if (typeof body.personality_mode === 'string') {
        settings.personality_mode = body.personality_mode;
      }
      if (typeof body.coin_cap_pct === 'number') {
        settings.coin_cap_pct = body.coin_cap_pct;
      }
      if (typeof body.loss_limit_pct === 'number') {
        settings.loss_limit_pct = body.loss_limit_pct;
      }
      if (typeof body.latency_limit_ms === 'number') {
        settings.latency_limit_ms = body.latency_limit_ms;
      }
      if (typeof body.sweep_cadence_s === 'number') {
        settings.sweep_cadence_s = body.sweep_cadence_s;
      }
      if (typeof body.useEnsemble === 'boolean') {
        settings.useEnsemble = body.useEnsemble;
      }
      if (typeof body.shadowOnly === 'boolean') {
        settings.shadowOnly = body.shadowOnly;
      }
      if (typeof body.ghost_mode === 'boolean') {
        settings.ghost_mode = body.ghost_mode;
      }
      if (typeof body.canary_mode === 'boolean') {
        settings.canary_mode = body.canary_mode;
      }
      if (typeof body.sandbox_mode === 'boolean' && !process.env.SANDBOX_MODE) {
        settings.sandbox_mode = body.sandbox_mode;
      }
    };

    api.get('/settings', async () => settings);
    api.patch('/settings', async req => {
      updateSettings(req.body);
      return { saved: true };
    });

    api.post('/settings', async req => {
      updateSettings(req.body);
    return { saved: true };
  });

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

    
  api.get('/metrics', async () => ({ status: 'ok' }));

  api.post('/logout', async (req, reply) => {
    reply.clearCookie('token');
    return { loggedOut: true };
  });

  api.post('/resume', async () => {
    await redis.publish('control-feed', 'resume');
    return { resumed: true };
  });

  api.register(userRoutes, { prefix: '/users' });
  api.register(infraRoutes, { redis, pool });
  api.register(modelRoutes, { pool });
  api.register(metricsRoutes);
  api.register(analyticsRoutes, { pool });
}


if (process.env.NODE_ENV !== 'test') {
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

