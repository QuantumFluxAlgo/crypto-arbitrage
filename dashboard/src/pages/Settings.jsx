// UI for adjusting trading personality mode
import React, { useEffect, useState } from 'react';

// PATCH selected settings to API
async function saveSettings(values) {
  try {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
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
  const [lossCapPct, setLossCapPct] = useState(0);
  const [latencyMaxMs, setLatencyMaxMs] = useState(250);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.personality_mode) {
            setMode(data.personality_mode.toLowerCase());
          }
          if (typeof data.maxLossPct === 'number') {
            setLossCapPct(data.maxLossPct);
          }
          if (typeof data.latencyMaxMs === 'number') {
            setLatencyMaxMs(data.latencyMaxMs);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    }
    fetchSettings();
  }, []);

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
      <div>
        <label className="block">
          Loss Cap %: <span data-testid="loss-cap">{lossCapPct}</span>
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={lossCapPct}
          onChange={(e) => setLossCapPct(Number(e.target.value))}
        />
      </div>
      <div>
        <label className="block">
          Max Latency (ms): <span data-testid="latency-cap">{latencyMaxMs}</span>
        </label>
        <input
          type="range"
          min="50"
          max="1000"
          step="50"
          value={latencyMaxMs}
          onChange={(e) => setLatencyMaxMs(Number(e.target.value))}
        />
      </div>
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded"
        onClick={() =>
          saveSettings({
            personality_mode: mode,
            maxLossPct: lossCapPct,
            latencyMaxMs,
          })
        }
      >
        Save
      </button>
    </div>
  );
}
