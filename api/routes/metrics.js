import axios from 'axios';
import { settings } from './settings.js';

const PROM_URL = process.env.PROM_URL || 'http://localhost:9090';

export default async function metricsRoutes(app, { testState } = {}) {
  const seeded = {
    equityCurve: Array.from({ length: 20 }, (_, i) => i * 5),
    latency: Array.from({ length: 20 }, () => 30 + Math.random() * 10),
    openTrades: [],
    panicActive: false,
    alertsEnabled: false,
    winRate: [],
  };

  app.get('/metrics', async (req) => {
    if (settings.sandbox_mode || process.env.NODE_ENV === 'test') {
     return { ...seeded, panicActive: testState?.panic ?? false };
    }

    try {
      const eq = await axios.get(`${PROM_URL}/api/v1/query`, {
        params: { query: 'equity' },
      });
      const lat = await axios.get(`${PROM_URL}/api/v1/query`, {
        params: { query: 'request_latency_seconds' },
      });

      const equityCurve = eq.data.data?.result?.[0]?.values?.map(v => parseFloat(v[1])) || [];
      const latency = lat.data.data?.result?.[0]?.values?.map(v => parseFloat(v[1])) || [];

      return {
        equityCurve,
        latency,
        openTrades: [],
        panicActive: false,
        alertsEnabled: false,
        winRate: [],
      };
    } catch (err) {
      req.log.error(err, 'prometheus fetch failed');
      return { equityCurve: [], latency: [] };
    }
  });
}
