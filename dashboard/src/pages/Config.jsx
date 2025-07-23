import React, { useEffect, useState } from 'react';

export default function Config() {
  const [maxLoss, setMaxLoss] = useState(5);
  const [maxLatency, setMaxLatency] = useState(250);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.maxLoss === 'number') setMaxLoss(data.maxLoss);
          if (typeof data.maxLatency === 'number') setMaxLatency(data.maxLatency);
        } else {
          setToast({ type: 'error', msg: 'Failed to load config' });
        }
      } catch {
        setToast({ type: 'error', msg: 'Failed to load config' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function save() {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxLoss, maxLatency }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setToast({ type: 'success', msg: 'Saved config' });
      } else {
        setToast({ type: 'error', msg: data.error || 'Invalid config' });
      }
    } catch {
      setToast({ type: 'error', msg: 'Save failed' });
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative p-4 space-y-4">
      {toast && (
        <div
          className={`absolute right-4 top-4 px-3 py-2 text-white rounded ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <label className="block">
        Max Loss
        <input
          type="number"
          className="ml-2 border"
          value={maxLoss}
          onChange={(e) => setMaxLoss(Number(e.target.value))}
        />
      </label>
      <label className="block">
        Max Latency
        <input
          type="number"
          className="ml-2 border"
          value={maxLatency}
          onChange={(e) => setMaxLatency(Number(e.target.value))}
        />
      </label>
      <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save}>
        Save
      </button>
    </div>
  );
}
