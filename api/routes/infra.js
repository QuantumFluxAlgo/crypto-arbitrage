import { execSync } from 'child_process';

export default async function infraRoutes(app, opts) {
  const { redis, pool } = opts;

  app.get('/infra/status', async () => {
    const pods = [
      { name: 'api', status: 'Running' },
      { name: 'analytics', status: 'Running' },
      { name: 'executor', status: 'Running' },
      { name: 'dashboard', status: 'Running' }
    ];

    let gpuUtil = 0;
    try {
      const out = execSync(
        'nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits',
        { encoding: 'utf8' }
      );
      gpuUtil = parseInt(out.trim(), 10) || 0;
    } catch (err) {
      app.log.warn('nvidia-smi failed');
    }

    let redisStatus = 'Unhealthy';
    try {
      if (typeof redis.ping === 'function') {
        await redis.ping();
      }
      redisStatus = 'Healthy';
    } catch {
      redisStatus = 'Unhealthy';
    }

    let dbStatus = 'Unhealthy';
    try {
      await pool.query('SELECT 1');
      dbStatus = 'Healthy';
    } catch {
      dbStatus = 'Unhealthy';
    }

    return {
      pods,
      gpu: gpuUtil,
      db: dbStatus === 'Healthy',
      redis: redisStatus === 'Healthy',
      components: [
        { name: 'Redis', status: redisStatus },
        { name: 'Postgres', status: dbStatus }
      ]
    };
  });
}
