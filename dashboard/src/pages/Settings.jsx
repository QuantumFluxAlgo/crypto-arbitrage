import React, { useState } from 'react';

async function saveSettings(mode) {
  try {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personality_mode: mode }),
    });
    if (!res.ok) {
      throw new Error('Failed to save');
    }
  } catch (err) {
    console.error('Error saving settings', err);
  }
}

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
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded"
        onClick={() => saveSettings(mode)}
      >
        Save
      </button>
    </div>
  );
}
