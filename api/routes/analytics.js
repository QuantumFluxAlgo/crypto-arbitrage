import { settings } from './settings.js';

export default async function analyticsRoutes(app, opts) {
  const { pool } = opts;

  app.get('/trades/history', async (req) => {
    if (settings.sandbox_mode) {
      const now = Date.now();
      const trades = [];
      for (let i = 0; i < 50; i += 1) {
        trades.push({
          timestamp: new Date(now - (50 - i) * 60000).toISOString(),
          pnl: Number((Math.sin(i / 5) * 10).toFixed(2)),
          prediction: Math.random(),
        });
      }
      return trades;
    }

    try {
      const { rows } = await pool.query(
        'SELECT pair, pnl, timestamp FROM trades ORDER BY timestamp DESC LIMIT 50'
      );
      return rows.map((row) => ({
        pair: row.pair,
        pnl: row.pnl,
        timestamp: row.timestamp,
      }));
    } catch (err) {
      req.log.error(err);
      return [];
    }
  });
}
