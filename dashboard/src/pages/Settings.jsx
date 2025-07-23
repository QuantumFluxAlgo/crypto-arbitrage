// UI for adjusting trading personality mode
import React, { useEffect, useState } from 'react';

// PATCH selected settings to API
async function patchSettings(values, setToast) {
  try {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setToast({ type: 'error', msg: data.error || 'Save failed' });
      return;
    }
    setToast({ type: 'success', msg: 'Settings saved' });
  } catch (err) {
    console.error('Error saving settings', err);
    setToast({ type: 'error', msg: 'Save failed' });
  }
}

export default function Settings() {
  const [mode, setMode] = useState('auto');
  const [lossCapPct, setLossCapPct] = useState(0);
  const [latencyMaxMs, setLatencyMaxMs] = useState(250);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.personality_mode) {
            setMode(data.personality_mode.toLowerCase());
          }
          if (typeof data.loss_cap_pct === 'number') {
            setLossCapPct(data.loss_cap_pct);
          }
          if (typeof data.latency_max_ms === 'number') {
            setLatencyMaxMs(data.latency_max_ms);
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
          min="1"
          max="10"
          step="0.5"
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
          onChange={async (e) => {
            const val = Number(e.target.value);
            setLatencyMaxMs(val);
            await patchSettings({ latency_max_ms: val }, setToast);
          }}
        />
      </div>
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded"
        onClick={() =>
          patchSettings(
            {
              personality_mode: mode,
              loss_cap_pct: lossCapPct,
              latency_max_ms: latencyMaxMs,
            },
            setToast
          )
        }
      >
        Save
      </button>
      {toast && (
        <div
          className={`absolute right-4 top-4 px-4 py-2 text-white rounded ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
