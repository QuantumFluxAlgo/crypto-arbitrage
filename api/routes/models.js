export default async function modelRoutes(app, opts) {
  const { pool } = opts;

  app.get('/model/version', async (req, reply) => {
    try {
      const { rows } = await pool.query(
        'SELECT version_hash, trained_at, sharpe, win_rate, val_loss FROM model_metadata ORDER BY trained_at DESC LIMIT 1'
      );
      if (rows.length > 0) {
        return rows[0];
      }
      reply.code(404);
      return { error: 'not found' };
    } catch (err) {
      req.log.error(err);
      reply.code(500);
      return { error: 'db error' };
    }
  });

  app.post('/models/event', async (req, reply) => {
    const { version_hash, change_type, changed_by } = req.body;
    if (!version_hash || !change_type) {
      reply.code(400);
      return { error: 'version_hash and change_type required' };
    }
    const source_ip = req.ip;
    try {
      await pool.query(
        `INSERT INTO model_metadata
            (version_hash, trained_at, changed_by, change_type, source_ip)
         VALUES ($1, NOW(), $2, $3, $4)`,
        [version_hash, changed_by, change_type, source_ip]
      );
      return { logged: true };
    } catch (err) {
      req.log.error(err);
      reply.code(500);
      return { error: 'db error' };
    }
  });
}
