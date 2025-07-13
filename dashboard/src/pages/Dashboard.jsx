import React, { useState } from 'react';
import { useSystemStatus } from '../context/SystemStatusContext.jsx';
import LiveMetrics from '../../components/LiveMetrics.jsx';

export default function Dashboard() {
  const [mode, setMode] = useState('auto');
  const [status] = useState('green');
  const walletBalance = '$0.00';
  const { panic, reason, refreshStatus } = useSystemStatus();

  async function handleResume() {
    try {
      const res = await fetch('/api/resume', { method: 'POST' });
      if (res.ok) {
        await refreshStatus();
      }
    } catch (err) {
      console.error('Failed to resume trading', err);
    }
  }

  return (
    <div className="p-4 space-y-4 text-text">
      <h1 className="text-2xl font-bold">Arbitrage Summary</h1>
      <div className="bg-surface p-4 rounded shadow">
        <LiveMetrics />
      </div>
      <div className="bg-surface p-4 rounded shadow space-y-4">
        <div>
          Wallet Balance: <span data-testid="wallet-balance">{walletBalance}</span>
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
            className={`ml-2 font-semibold ${
              status === 'green' ? 'text-green-600' : status === 'yellow' ? 'text-yellow-400' : 'text-red-600'
            }`}
          >
            {status}
          </span>
        </div>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:text-gray-500"
          disabled={!panic}
          title={`Panic triggered: ${reason} — click to resume`}
          onClick={handleResume}
        >
          Resume Trading
        </button>
      </div>
    </div>
  );
}
