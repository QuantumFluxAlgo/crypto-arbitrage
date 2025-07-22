import React, { useEffect, useState } from 'react';
import { useSystemStatus } from '../context/SystemStatusContext.jsx';
import LiveMetrics from '../../components/LiveMetrics.jsx';
import ResumeButton from '../components/ResumeButton.jsx';
import { fetchSystemStatus, fetchWalletBalance } from '../utils/api.js';

export default function Dashboard() {
  const [mode, setMode] = useState('auto');
  const [walletBalance, setWalletBalance] = useState(null);
  const [metrics, setMetrics] = useState({ equityCurve: [], latency: [], openTrades: [], winRate: [] });
  const { panic, refreshStatus } = useSystemStatus();

  useEffect(() => {
    async function load() {
      try {
        const balance = await fetchWalletBalance();
        setWalletBalance(balance.balance);
      } catch (err) {
        console.error('Failed to fetch wallet balance', err);
      }
      try {
        const status = await fetchSystemStatus();
        if (status.mode) setMode(status.mode);
      } catch (err) {
        console.error('Failed to fetch status', err);
      }
      try {
        const res = await fetch('/api/metrics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error('Failed to fetch metrics', err);
      }
      refreshStatus();
    }
    load();
  }, [refreshStatus]);

  return (
    <div className="p-4 space-y-4 text-text">
      <h1 className="text-2xl font-bold">Arbitrage Summary</h1>
      <div className="bg-surface p-4 rounded shadow">
        <LiveMetrics equity={metrics.equityCurve} latency={metrics.latency} />
      </div>
      <div className="bg-surface p-4 rounded shadow space-y-4">
        <div>
          Wallet Balance: <span data-testid="wallet-balance">{walletBalance ?? 'N/A'}</span>
        </div>
        <div>
          Open Trades: {metrics.openTrades ? metrics.openTrades.length : 0}
        </div>
        <div className="space-x-2">
          {['auto', 'realistic', 'aggressive'].map((m) => (
            <button
              key={m}
              className={`px-3 py-1 rounded ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <div>
          System Status:
          <span
            data-testid="system-status"
            className={`ml-2 font-semibold ${panic ? 'text-red-600' : 'text-green-600'}`}
          >
            {panic ? 'paused' : 'active'}
          </span>
          {panic && <span className="ml-1 text-red-600">⚠️</span>}
        </div>
        <div className="space-x-2">
          <button
            className="bg-red-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:text-gray-500"
            disabled={panic}
            onClick={async () => {
              try {
                await fetch('/api/panic', { method: 'POST' });
                await refreshStatus();
              } catch (err) {
                console.error('Failed to trigger panic', err);
              }
            }}
          >
            Pause Trading
          </button>
          <ResumeButton />
        </div>
      </div>
    </div>
  );
}
