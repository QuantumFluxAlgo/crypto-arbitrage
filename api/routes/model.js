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
}
