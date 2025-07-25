import logger from '../services/logger.js';

export async function requireAdmin(req, reply) {
  const mode = process.env.EXECUTION_MODE || (process.env.SANDBOX_MODE === 'true' ? 'sandbox' : 'live');
  if (mode === 'sandbox' || process.env.DRY_RUN === 'true') {
    return;
  }
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    return;
  }
  logger.warn(`[RESUME-BLOCKED] mode=${mode} ip=${req.ip}`);
  reply.code(401).send({ error: 'unauthorized' });
}

export async function verifyJwt(req, reply) {
  if (process.env.DRY_RUN === 'true') {
    req.user = { email: 'admin@prism.one', role: 'admin', dryRun: true };
    return;
  }
  try {
    await req.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'unauthorized' });
    throw new Error('unauthorized');
  }
}
