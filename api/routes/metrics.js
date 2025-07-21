// Exposes Prometheus metrics and seeded data in sandbox
import axios from 'axios';
import { getExecutionMode } from '../config/settings.js';
// PROM_* env variables choose Prometheus endpoint

const PROM_LIVE_URL = process.env.PROM_LIVE_URL || process.env.PROM_URL || 'http://prometheus:9090';
const PROM_SANDBOX_URL = process.env.PROM_SANDBOX_URL || 'http://prometheus-sandbox:9090';

export default async function metricsRoutes(app, { testState } = {}) {
  const seeded = {
    equityCurve: Array.from({ length: 20 }, (_, i) => i * 5),
    latency: Array.from({ length: 20 }, () => 30 + Math.random() * 10),
    openTrades: [],
    panicActive: false,
    alertsEnabled: false,
    winRate: [],
  };

  const fetchMetrics = async (req, mode) => {
    const execMode = mode || getExecutionMode(req);
    if (execMode === 'sandbox' || process.env.NODE_ENV === 'test') {
      return { ...seeded, panicActive: testState?.panic ?? false };
    }

    const promUrl = execMode === 'live' ? PROM_LIVE_URL : PROM_SANDBOX_URL;
    try {
      const eq = await axios.get(`${promUrl}/api/v1/query`, {
        params: { query: 'equity' },
      });
      const lat = await axios.get(`${promUrl}/api/v1/query`, {
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
  };

  app.get('/metrics/live', async (req) => fetchMetrics(req, 'live'));
  app.get('/metrics/sandbox', async (req) => fetchMetrics(req, 'sandbox'));

  app.get('/metrics', async (_req, reply) => {
    reply.code(404).send({ error: 'deprecated endpoint' });
  });
}
