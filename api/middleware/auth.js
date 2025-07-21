import logger from '../services/logger.js';

export async function requireAdmin(req, reply) {
  const mode = process.env.EXECUTION_MODE || (process.env.SANDBOX_MODE === 'true' ? 'sandbox' : 'live');
  if (mode === 'sandbox') {
    return;
  }
  if (req.user && (req.user.role === 'admin' || req.user.isAdmin)) {
    return;
  }
  logger.warn(`[RESUME-BLOCKED] mode=${mode} ip=${req.ip}`);
  reply.code(401).send({ error: 'unauthorized' });
}
