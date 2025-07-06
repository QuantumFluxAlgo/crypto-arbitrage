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
import { sendAlert } from './services/alertManager.js';
import auditLogger, { logReplayCLI } from './middleware/auditLogger.js';

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
@@ -115,35 +115,37 @@ async function apiRoutes(api) {
    } catch (err) {
      req.log.error(err);
      return [];
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
}

app.register(apiRoutes, { prefix: '/api' });

if (process.env.NODE_ENV !== 'test') {
  app.listen({ port: 8080, host: '0.0.0.0' }, err => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    logger.info('API service started');
  });
}

export default app;
export { logReplayCLI };
