import logger from '../services/logger.js';

export function logReplayCLI(pool, userId, payload = {}) {
  return pool.query(
    'INSERT INTO audit_log (timestamp, user_id, action, payload) VALUES (NOW(), $1, $2, $3)',
    [userId, 'replay_cli', JSON.stringify(payload)]
  ).catch(err => {
    logger.error(`Failed to log replay CLI: ${err.message}`);
  });
}

export default async function auditLogger(app, opts) {
  const { pool } = opts;
  app.addHook('preHandler', async (req) => {
    if (req.method === 'PATCH' && req.url.endsWith('/settings')) {
      let userId = null;
      try {
        const token = req.cookies?.token;
        if (token) {
          const decoded = app.jwt.decode(token);
          userId = decoded.email;
        }
      } catch {
        userId = null;
      }
      try {
        await pool.query(
          'INSERT INTO audit_log (timestamp, user_id, action, payload) VALUES (NOW(), $1, $2, $3)',
          [userId, 'settings_patch', JSON.stringify(req.body)]
        );
      } catch (err) {
        req.log.error('Failed to write audit log', err);
      }
    }
  });
}
