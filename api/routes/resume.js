import { requireAdmin } from '../middleware/auth.js';

export default async function resumeRoutes(app, opts) {
  const { redis, testState } = opts;

  app.post('/resume', { preHandler: requireAdmin }, async () => {
    if (testState) testState.panic = false;
    await redis.publish('control-feed', 'resume');
    return { resumed: true };
  });
}
