import logger from '../services/logger.js';

export default async function opportunitiesRoutes(app, opts) {
  const { redis } = opts;
  const KEY = 'arb:spread:opportunities';

  app.get('/opportunities', async (req) => {
    try {
      const cached = await redis.get(KEY);
      if (!cached) {
        req.log.info('[API] No opportunities available or Redis cache empty');
        return {
          opportunities: [],
          dryRun: true,
          timestamp: new Date().toISOString()
        };
      }
      let opportunities = [];
      try {
        opportunities = JSON.parse(cached);
      } catch (err) {
        logger.error(`[REDIS] Failed to read opportunities: ${err.message}`);
        return {
          opportunities: [],
          dryRun: true,
          timestamp: new Date().toISOString()
        };
      }
      return {
        opportunities,
        dryRun: true,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      logger.error(`[REDIS] Failed to read opportunities: ${err.message}`);
      return {
        opportunities: [],
        dryRun: true,
        timestamp: new Date().toISOString()
      };
    }
  });
}
