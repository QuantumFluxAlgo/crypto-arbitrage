import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Settings() {
  const [settings, setSettings] = useState({
    personality_mode: 'Conservative',
    coin_cap_pct: 0,
    loss_limit_pct: 0,
    latency_limit_ms: 0,
    sweep_cadence_s: 0,
    useEnsemble: false,
    shadowOnly: false,
    ghost_mode: false,
    sandbox_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings({
          personality_mode: data.personality_mode ?? 'Conservative',
          coin_cap_pct: data.coin_cap_pct ?? 0,
          loss_limit_pct: data.loss_limit_pct ?? 0,
          latency_limit_ms: data.latency_limit_ms ?? 0,
          sweep_cadence_s: data.sweep_cadence_s ?? 0,
          useEnsemble: data.useEnsemble ?? false,
          shadowOnly: data.shadowOnly ?? false,
          ghost_mode: data.ghost_mode ?? false,
          sandbox_mode: data.sandbox_mode ?? false,
        });
      } catch {
        setError('Unable to load settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setSettings((s) => ({
      ...s,
      [name]: type === 'checkbox' ? checked : Number(value) || value
    }));
  }
  
    async function handleGhostChange(e) {
    const { checked } = e.target;
    setSettings((s) => ({ ...s, ghost_mode: checked }));
    try {
      await axios.patch('/api/settings', { ghost_mode: checked });
      setToast({ type: 'success', msg: 'Simulation overlay updated' });
    } catch {
      setToast({ type: 'error', msg: 'Update failed' });
    }
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function saveSettings() {
    try {
      await axios.patch('/api/settings', settings);
      alert('Settings saved');
    } catch {
      alert('Save failed');
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-error">{error}</div>;

  return (
    <div className="relative max-w-xl m-auto p-6 space-y-6 bg-surface text-text rounded shadow">
      {toast && (
        <div
          className={`absolute right-4 top-4 px-4 py-2 text-white rounded ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <div className="space-x-2">
        {['Conservative', 'Balanced', 'Aggressive'].map((mode) => (
          <button
            key={mode}
            className={`px-3 py-1 rounded ${
              settings.personality_mode === mode ? 'bg-primary text-white' : 'bg-background'
            }`}
            onClick={() => setSettings((s) => ({ ...s, personality_mode: mode }))}
          >
            {mode}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="block mb-1">Coin Cap: {settings.coin_cap_pct}%</span>
        <input
          type="range"
          min="0"
          max="100"
          name="coin_cap_pct"
          value={settings.coin_cap_pct}
          onChange={handleChange}
          className="w-full"
        />
      </label>

      <label className="block">
        <span className="block mb-1">Loss Limit %</span>
        <input
          type="number"
          name="loss_limit_pct"
          value={settings.loss_limit_pct}
          onChange={handleChange}
          className="w-full rounded p-2 text-black"
        />
      </label>

      <label className="block">
        <span className="block mb-1">Latency Limit (ms)</span>
        <input
          type="number"
          name="latency_limit_ms"
          value={settings.latency_limit_ms}
          onChange={handleChange}
          className="w-full rounded p-2 text-black"
        />
      </label>

      <label className="block">
        <span className="block mb-1">Sweep Cadence: {settings.sweep_cadence_s}s</span>
        <input
          type="range"
          min="0"
          max="60"
          name="sweep_cadence_s"
          value={settings.sweep_cadence_s}
          onChange={handleChange}
          className="w-full"
        />
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="useEnsemble"
          checked={settings.useEnsemble}
          onChange={handleChange}
          className="accent-primary h-4 w-4"
        />
        <span>Use Ensemble Model</span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="shadowOnly"
          checked={settings.shadowOnly}
          onChange={handleChange}
          className="accent-primary h-4 w-4"
        />
        <span>Shadow Only</span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="ghost_mode"
          checked={settings.ghost_mode}
          onChange={handleChange}
          className="accent-primary h-4 w-4"
        />
        <span>Ghost Mode</span>
      </label>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="sandbox_mode"
          checked={settings.sandbox_mode}
          onChange={handleChange}
          className="accent-primary h-4 w-4"
        />
        <span>Sandbox Mode</span>
      </label>

      <button
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
        onClick={saveSettings}
      >
        Save
      </button>
    </div>
  );
}
