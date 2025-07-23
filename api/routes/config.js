import { z } from 'zod';
import { requireAdmin } from '../middleware/auth.js';
import logger from '../services/logger.js';

export const MAX_LOSS_LIMIT = 15;
export const MIN_LATENCY_MS = 200;
export const MAX_LATENCY_MS = 3000;

export const config = {
  maxLoss: 5,
  // align with executor default of 250ms
  maxLatency: 250,
};

export default async function configRoutes(app) {
  const schema = z
    .object({
      maxLoss: z.number().min(0).max(MAX_LOSS_LIMIT).optional(),
      maxLatency: z
        .number()
        .min(MIN_LATENCY_MS)
        .max(MAX_LATENCY_MS)
        .optional(),
    })
    .strict();

  app.get('/config', async () => config);

  app.post('/config', { preHandler: requireAdmin }, async (req, reply) => {
    const user = req.user?.email || 'unknown';
    const ts = new Date().toISOString();
    const result = schema.safeParse(req.body);

    if (!result.success || Object.keys(result.data).length === 0) {
      for (const [k, v] of Object.entries(req.body || {})) {
        logger.audit(
          `[CONFIG OVERRIDE] ts=${ts} user=${user} key=${k} value=${v} outcome=rejected`
        );
      }
      reply.code(400);
      return { error: 'invalid config' };
    }

    for (const [k, v] of Object.entries(result.data)) {
      logger.audit(
        `[CONFIG OVERRIDE] ts=${ts} user=${user} key=${k} value=${v} outcome=accepted`
      );
    }

    Object.assign(config, result.data);
    return { saved: true };
  });
}
