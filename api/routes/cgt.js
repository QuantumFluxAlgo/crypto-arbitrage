export default async function cgtRoutes(app, opts) {
  const { pool } = opts;

  app.get('/cgt/export', async (req, reply) => {
    try {
      const { rows } = await pool.query(
        'SELECT asset, side, amount, price, cost_basis, gain, timestamp FROM cgt_audit ORDER BY timestamp'
      );
      return rows;
    } catch (err) {
      req.log.error(err);
      reply.code(500);
      return { error: 'failed' };
    }
  });
}
