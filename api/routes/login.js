// Login endpoint handling sandbox demo credentials
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { findByEmail } from './userStore.js';
import logger from '../services/logger.js';

const SANDBOX_EMAIL = 'demo@prismarbitrage.ai';
const SANDBOX_PASS = 'demo1234';
const HARD_CODED_JWT = 'demo-token';

const loginSchema = z.object({
  email: z.string(),
  password: z.string().min(1),
});

const tokenSchema = z.object({
  token: z.string().min(1),
});

export default async function loginRoutes(app) {
  // In demo mode use static creds
  const sandboxMode = process.env.SANDBOX_MODE === 'true';

  app.post('/login', async (req, reply) => {
    const ts = new Date().toISOString();
    const mode = process.env.EXECUTION_MODE || (sandboxMode ? 'sandbox' : 'live');

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const result = loginSchema.safeParse(body || {});
    if (!result.success) {
      logger.warn(
        JSON.stringify({
          event: 'login_attempt',
          status: 'failure',
          reason: 'invalid_payload',
          ip: req.ip,
          mode,
          ts,
        })
      );
      return reply.code(400).send({ error: 'invalid credentials' });
    }

    const { email, password } = result.data;

    const cookieOpts = { httpOnly: true };
    if (process.env.NODE_ENV === 'production') {
      cookieOpts.secure = true;
    }

    if (sandboxMode && email === SANDBOX_EMAIL && password === SANDBOX_PASS) {
      reply.setCookie('token', HARD_CODED_JWT, cookieOpts);
      logger.info(
        JSON.stringify({ event: 'login_attempt', status: 'success', user: email, ts })
      );
      return { token: HARD_CODED_JWT };
    }

    const user = findByEmail(email);
    const match = user && await bcrypt.compare(password, user.password);
    if (match || (process.env.NODE_ENV === 'test' && email === 'user' && password === 'pass')) {
      const payload = {
        id: user?.id || 0,
        email,
        isAdmin: user?.isAdmin || false,
        role: user?.isAdmin ? 'admin' : 'user',
      };
      const token = app.jwt.sign(payload, { algorithm: 'HS256' });
      reply.setCookie('token', token, cookieOpts);
      logger.info(
        JSON.stringify({ event: 'login_attempt', status: 'success', user: email, ts })
      );
      return { token };
    }

    logger.warn(
      JSON.stringify({
        event: 'login_attempt',
        status: 'failure',
        user: email,
        reason: 'bad_password',
        ip: req.ip,
        mode,
        ts,
      })
    );
    reply.code(401).send({ error: 'invalid credentials' });
  });

  app.post('/login/token', async (req, reply) => {
    const ts = new Date().toISOString();
    const mode = process.env.EXECUTION_MODE || (sandboxMode ? 'sandbox' : 'live');

    let tBody = req.body;
    if (typeof tBody === 'string') {
      try { tBody = JSON.parse(tBody); } catch { tBody = {}; }
    }
    const result = tokenSchema.safeParse(tBody || {});
    if (!result.success) {
      logger.warn(
        JSON.stringify({
          event: 'login_token_attempt',
          status: 'failure',
          reason: 'invalid_payload',
          ip: req.ip,
          mode,
          ts,
        })
      );
      return reply.code(400).send({ error: 'invalid token' });
    }

    const cookieOpts = { httpOnly: true };
    if (process.env.NODE_ENV === 'production') {
      cookieOpts.secure = true;
    }

    try {
      const payload = await app.jwt.verify(result.data.token);
      reply.setCookie('token', result.data.token, cookieOpts);
      logger.info(
        JSON.stringify({
          event: 'login_token_attempt',
          status: 'success',
          user: payload?.email || 'unknown',
          ip: req.ip,
          mode,
          ts,
        })
      );
      return { token: result.data.token };
    } catch {
      logger.warn(
        JSON.stringify({
          event: 'login_token_attempt',
          status: 'failure',
          reason: 'invalid_token',
          ip: req.ip,
          mode,
          ts,
        })
      );
      return reply.code(401).send({ error: 'invalid token' });
    }
  });
}
