import React, { useState, useEffect } from 'react';
import { useSystemStatus } from '../context/SystemStatusContext.jsx';

export default function ResumeButton() {
  const { panic, reason, refreshStatus } = useSystemStatus();
  const [blocked, setBlocked] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleResume() {
    setBlocked(false);
    try {
      const res = await fetch('/api/resume', { method: 'POST' });
      if (res.status === 503) {
        setBlocked(true);
        setToast({ type: 'error', msg: 'System not ready for resume.' });
        return;
      }
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        if (data.override_required) {
          setConfirm(true);
          return;
        }
      }
      if (res.ok) {
        await refreshStatus();
        setToast({ type: 'success', msg: 'Resume in progress...' });
      }
    } catch (err) {
      console.error('Failed to resume trading', err);
    }
  }

  async function confirmResume() {
    try {
      const res = await fetch('/api/resume?confirm=true', { method: 'POST' });
      if (res.status === 503) {
        setConfirm(false);
        setBlocked(true);
        setToast({ type: 'error', msg: 'System not ready for resume.' });
        return;
      }
      if (res.ok) {
        setConfirm(false);
        await refreshStatus();
        setToast({ type: 'success', msg: 'Resume in progress...' });
      }
    } catch (err) {
      console.error('Resume confirm failed', err);
    }
  }

  const title = blocked
    ? 'System not ready to resume \u2014 check logs'
    : `Panic triggered: ${reason} \u2014 click to resume`;

  return (
    <div className="relative inline-block">
      {toast && (
        <div
          className={`absolute right-0 -top-8 px-2 py-1 text-white rounded ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
      <button
        className="bg-green-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:text-gray-500"
        disabled={!panic || blocked}
        title={title}
        onClick={handleResume}
      >
        Resume Trading
      </button>
      {confirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded space-y-4">
            <p>Risk thresholds still breached. Resume anyway?</p>
            <div className="flex justify-end space-x-2">
              <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setConfirm(false)}>
                Cancel
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={confirmResume}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
