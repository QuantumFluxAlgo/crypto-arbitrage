export default async function systemHealthRoutes(app, opts) {
  const { redis, pool } = opts;

  app.get('/system/health', async () => {
    let redisHealthy = true;
    try {
      if (typeof redis.ping === 'function') {
        await redis.ping();
      }
    } catch {
      redisHealthy = false;
    }

    let dbHealthy = true;
    try {
      await pool.query('SELECT 1');
    } catch {
      dbHealthy = false;
    }

    return {
      healthy: redisHealthy && dbHealthy,
      subsystems: {
        redis: redisHealthy,
        db: dbHealthy,
      },
    };
  });
}
