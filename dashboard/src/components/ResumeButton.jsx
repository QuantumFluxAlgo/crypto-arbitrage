import React, { useState } from 'react';
import { useSystemStatus } from '../context/SystemStatusContext.jsx';

export default function ResumeButton() {
  const { panic, reason, refreshStatus } = useSystemStatus();
  const [blocked, setBlocked] = useState(false);

  async function handleResume() {
    setBlocked(false);
    try {
      const res = await fetch('/api/resume', { method: 'POST' });
      if (res.status === 503) {
        setBlocked(true);
      }
      if (res.ok) {
        await refreshStatus();
      }
    } catch (err) {
      console.error('Failed to resume trading', err);
    }
  }

  const title = blocked
    ? 'System not ready to resume \u2014 check logs'
    : `Panic triggered: ${reason} \u2014 click to resume`;

  return (
    <button
      className="bg-green-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:text-gray-500"
      disabled={!panic || blocked}
      title={title}
      onClick={handleResume}
    >
      Resume Trading
    </button>
  );
}
