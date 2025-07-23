import React, { useState, useEffect } from 'react';
import { useSystemStatus } from '../context/SystemStatusContext.jsx';

export default function ResumeButton() {
  const { panic, reason, refreshStatus } = useSystemStatus();
  const [blocked, setBlocked] = useState(false);
  const [confirmOverride, setConfirmOverride] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleResume(confirmed = false) {
    setBlocked(false);
    try {
      const url = confirmed ? '/api/resume?confirm=true' : '/api/resume';
      const res = await fetch(url, { method: 'POST' });
      if (res.status === 503) {
        setBlocked(true);
        setToast('System not ready for resume.');
        return;
      }
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        if (data.override_required) {
          setConfirmOverride(true);
          return;
        }
        setBlocked(true);
        setToast('System not ready for resume.');
        return;
      }
      if (res.ok) {
        await refreshStatus();
        setToast('Resume in progress...');
        setConfirmOverride(false);
      }
    } catch (err) {
      console.error('Failed to resume trading', err);
    }
  }

  const title = blocked
    ? 'System not ready to resume \u2014 check logs'
    : `Panic triggered: ${reason} \u2014 click to resume`;

  return (
    <div className="relative inline-block">
      {toast && (
        <div className="absolute right-0 -top-10 px-3 py-1 text-white bg-green-600 rounded">
          {toast}
        </div>
      )}
      <button
        className="bg-green-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:text-gray-500"
        disabled={!panic || blocked}
        title={title}
        onClick={() => handleResume(false)}
      >
        Resume Trading
      </button>
      {confirmOverride && (
        <div
          data-testid="resume-confirm-modal"
          className="absolute left-1/2 -translate-x-1/2 mt-2 p-4 bg-white border rounded shadow"
        >
          <p className="mb-2">Risk thresholds still breached. Resume anyway?</p>
          <div className="space-x-2 text-right">
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => handleResume(true)}
            >
              Confirm
            </button>
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => setConfirmOverride(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
