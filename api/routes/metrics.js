import { settings } from './settings.js';

export default async function metricsRoutes(app) {
  const seeded = {
    rollingPnL: 1200.5,
    win_rate: 58.2,
    latency: 35
  };

  app.get('/metrics', async () => {
    if (settings.sandbox_mode) {
      return seeded;
    }
    return { status: 'ok' };
  });
}
