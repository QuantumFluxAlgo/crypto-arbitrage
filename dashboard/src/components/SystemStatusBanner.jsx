import React, { useEffect, useState } from 'react';
import { fetchSystemStatus } from '../utils/api.js';

export default function SystemStatusBanner() {
  const [mode, setMode] = useState('live');
  const [panic, setPanic] = useState(false);
  const [resumeFailed, setResumeFailed] = useState(false);

  async function loadStatus() {
    try {
      const data = await fetchSystemStatus();
      setPanic(Boolean(data.paused));
      setResumeFailed(Boolean(data.resume_failed));
    } catch (err) {
      console.error('Failed to fetch system status', err);
    }

    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const cfg = await res.json();
        setMode(cfg.sandbox_mode ? 'sandbox' : 'live');
      }
    } catch (err) {
      console.error('Failed to fetch mode', err);
    }
  }

  useEffect(() => {
    loadStatus();
    const id = setInterval(loadStatus, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!resumeFailed) return;
    const t = setTimeout(() => setResumeFailed(false), 10000);
    return () => clearTimeout(t);
  }, [resumeFailed]);

  if (resumeFailed) {
    return (
      <div
        data-testid="resume-failed-banner"
        className="bg-red-700 text-white text-center py-2 font-semibold"
      >
        Resume failed: Executor not responding
        <button className="ml-2 underline" onClick={() => setResumeFailed(false)}>
          Dismiss
        </button>
      </div>
    );
  }

  let bg = 'bg-green-600';
  let text = '✅ Live - Trading Active';
  if (mode === 'live' && panic) {
    bg = 'bg-red-600';
    text = '🔴 Panic Mode - Trading Halted';
  } else if (mode === 'sandbox' && !panic) {
    bg = 'bg-orange-500';
    text = '🧪 Sandbox Mode - Simulation Running';
  } else if (mode === 'sandbox' && panic) {
    bg = 'bg-red-900';
    text = '🔒 Sandbox Panic - Simulating Failure State';
  }

  return (
    <div data-testid="system-status-banner" className={`${bg} text-white text-center py-2 font-semibold`}>
      {text}
    </div>
  );
}
