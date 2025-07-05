import { useEffect, useState } from 'react';

function LineChart({ data = [], color = '#00C8A0' }) {
  if (!data.length) {
    return <div className="h-32" />;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / (max - min || 1)) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-32">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    equityCurve: [],
    openTrades: [],
    panicActive: false,
    alertsEnabled: false,
    latency: [],
    winRate: [],
  });
  const [loading, setLoading] = useState(true);
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState('');

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/metrics');
        const data = await res.json();
        console.log('Metrics:', data);
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load metrics', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  async function handleResume() {
    setResuming(true);
    setResumeError('');
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Resume failed');
      await res.json();
      alert('Trading resumed');
    } catch (err) {
      console.error('Resume failed', err);
      setResumeError('Failed to resume');
    } finally {
      setResuming(false);
    }
  }

  return (
    <div className="p-4 space-y-6 text-text bg-background min-h-screen">
      <h1 className="text-2xl font-bold">Prism Arbitrage Dashboard</h1>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Equity Curve</h2>
              <LineChart data={metrics.equityCurve} color="#00C8A0" />
            </div>
            <div className="bg-surface p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Latency</h2>
              <LineChart data={metrics.latency} color="#416165" />
            </div>
            <div className="bg-surface p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Win Rate</h2>
              <LineChart data={metrics.winRate} color="#00C8A0" />
            </div>
            <div className="bg-surface p-4 rounded shadow md:row-span-3">
              <h2 className="font-semibold mb-2">Open Trades</h2>
              <table className="min-w-full text-sm text-left">
                <thead className="text-gray-400">
                  <tr>
                    <th className="px-2 py-1">Market</th>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.openTrades.map((t, i) => (
                    <tr key={i} className="odd:bg-background even:bg-surface">
                      <td className="px-2 py-1">{t.market}</td>
                      <td className="px-2 py-1">{t.type}</td>
                      <td className="px-2 py-1">{t.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <span>Panic</span>
              <input
                type="checkbox"
                checked={metrics.panicActive}
                readOnly
                className="accent-error h-4 w-4"
              />
            </label>
            <label className="flex items-center space-x-2">
              <span>Alerts</span>
              <input
                type="checkbox"
                checked={metrics.alertsEnabled}
                readOnly
                className="accent-primary h-4 w-4"
              />
            </label>
            <button
              className="ml-auto p-2 bg-green-600 text-white rounded"
              onClick={handleResume}
              disabled={resuming}
            >
              Resume Trading
            </button>
          </div>
          {resumeError && <div className="text-red-500">{resumeError}</div>}
        </>
      )
    </div>
  );
}
