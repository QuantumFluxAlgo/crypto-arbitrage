import { z } from 'zod';
import { requireAdmin } from '../middleware/auth.js';

export const config = {
  maxLoss: 5,
  // align with executor default of 250ms
  maxLatency: 250,
};

export default async function configRoutes(app) {
  const schema = z
    .object({
      maxLoss: z.number().min(0).max(25).optional(),
      maxLatency: z.number().min(100).max(5000).optional(),
    })
    .strict();

  app.get('/config', async () => config);

  app.post('/config', { preHandler: requireAdmin }, async (req, reply) => {
    const result = schema.safeParse(req.body);
    if (!result.success || Object.keys(result.data).length === 0) {
      reply.code(400);
      return { error: 'invalid config' };
    }
    Object.assign(config, result.data);
    return { saved: true };
  });
}
