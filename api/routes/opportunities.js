import logger from '../services/logger.js';
import { getExecutionMode } from '../config/settings.js';

export default async function opportunitiesRoutes(app, opts) {
  const { redis } = opts;
  const KEY = 'arb:spread:opportunities';

  app.get('/opportunities', async (req) => {
    const executionMode = getExecutionMode(req);
    try {
      const cached = await redis.get(KEY);
      if (!cached) {
        req.log.info('[API] No opportunities available or Redis cache empty');
        return {
          opportunities: [],
          executionMode,
          lastUpdated: new Date().toISOString(),
        };
      }
      let opportunities = [];
      try {
        opportunities = JSON.parse(cached);
      } catch (err) {
        logger.error(`[REDIS] Failed to read opportunities: ${err.message}`);
        return {
          opportunities: [],
          executionMode,
          lastUpdated: new Date().toISOString(),
        };
      }
      return {
        opportunities,
        executionMode,
        lastUpdated: new Date().toISOString(),
      };
    } catch (err) {
      logger.error(`[REDIS] Failed to read opportunities: ${err.message}`);
      return {
        opportunities: [],
        executionMode,
        lastUpdated: new Date().toISOString(),
      };
    }
  });
}
