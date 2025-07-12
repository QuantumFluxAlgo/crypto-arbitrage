import React, { useState } from 'react';
import LiveMetrics from '../../components/LiveMetrics.jsx';

export default function Dashboard() {
  const [mode, setMode] = useState('auto');
  const [status] = useState('green');
  const walletBalance = '$0.00';

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
      </div>
    </div>
  );
}
