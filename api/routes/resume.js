import { requireAdmin } from '../middleware/auth.js';

export default async function resumeRoutes(app, opts) {
  const { redis, testState } = opts;

  app.post('/resume', { preHandler: requireAdmin }, async (_req, reply) => {
    if (testState && !testState.paused) {
      reply.code(400);
      return { error: 'not paused' };
    }
    if (testState) {
      testState.paused = false;
      testState.panicReason = null;
    }
    await redis.publish('control-feed', 'resume');
    return { resumed: true };
  });
}
