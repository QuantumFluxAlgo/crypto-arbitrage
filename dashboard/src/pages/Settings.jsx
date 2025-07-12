import React, { useState } from 'react';

export default function Settings() {
  const [mode, setMode] = useState('auto');

  return (
    <div className="p-4 space-y-4 text-text">
      <h1 className="text-xl font-bold">Trading Modes</h1>
      <div className="space-x-2">
        {['auto', 'aggressive', 'realistic'].map((m) => (
          <button
            key={m}
            data-testid={`mode-${m}`}
            className={`px-3 py-1 rounded ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
