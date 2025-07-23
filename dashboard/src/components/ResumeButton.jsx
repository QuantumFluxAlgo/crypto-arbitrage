import React, { useState, useEffect } from 'react';
import { useSystemStatus } from '../context/SystemStatusContext.jsx';

export default function ResumeButton() {
  const { panic, reason, resumeFailed, refreshStatus } = useSystemStatus();
  const [blocked, setBlocked] = useState(false);
  const [confirmResume, setConfirmResume] = useState(false);
  const [confirmOverride, setConfirmOverride] = useState(false);
  const [toast, setToast] = useState(null);
  const [showFailed, setShowFailed] = useState(false);
  const [failMsg, setFailMsg] = useState('');
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!resumeFailed) return;
    setFailMsg('Resume failed: Executor not responding');
    setShowFailed(true);
  }, [resumeFailed]);

  useEffect(() => {
    if (!showFailed) return;
    const t = setTimeout(() => setShowFailed(false), 10000);
    return () => clearTimeout(t);
  }, [showFailed]);

  async function submitResume(confirmed = false) {
    setWaiting(true);
    setFailMsg('');
    try {
      const url = confirmed ? '/test/resume?confirm=true' : '/test/resume';
      const res = await fetch(url, { method: 'POST' });
      if (res.status === 503) {
        setBlocked(true);
        setWaiting(false);
        setToast('System not ready for resume.');
        return;
      }
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        if (data.override_required) {
          setWaiting(false);
          setConfirmOverride(true);
          return;
        }
        setBlocked(true);
        setWaiting(false);
        setToast('System not ready for resume.');
        return;
      }
      if (res.ok) {
        await new Promise((r) => setTimeout(r, 1500));
        const stRes = await fetch('/api/system/status');
        let success = false;
        if (stRes.ok) {
          const data = await stRes.json();
          success = !data.paused;
        }
        await refreshStatus();
        if (success) {
          setToast('Trading Resumed');
        } else {
          setFailMsg('Resume command failed. Trading is still paused.');
          setShowFailed(true);
        }
        setConfirmOverride(false);
      }
    } catch (err) {
      console.error('Failed to resume trading', err);
      setFailMsg('Resume command failed. Trading is still paused.');
      setShowFailed(true);
    }
    setWaiting(false);
  }

  const title = blocked
    ? 'System not ready to resume \u2014 check logs'
    : waiting
    ? 'Resuming...'
    : `Panic triggered: ${reason} \u2014 click to resume`;

  return (
    <div className="relative inline-block">
      {showFailed && (
        <div
          data-testid="resume-failed"
          className="absolute left-1/2 -translate-x-1/2 -top-12 bg-red-600 text-white px-4 py-2 rounded flex items-center"
        >
          <span>{failMsg || 'Resume failed: Executor not responding'}</span>
          <button className="ml-2" onClick={() => setShowFailed(false)}>×</button>
        </div>
      )}
      {toast && (
        <div className="absolute right-0 -top-10 px-3 py-1 text-white bg-green-600 rounded">
          {toast}
        </div>
      )}
      <button
        className="bg-green-600 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:text-gray-500"
        disabled={!panic || blocked || waiting}
        title={title}
        onClick={() => setConfirmResume(true)}
      >
        Resume Trading
      </button>
      {confirmResume && (
        <div
          data-testid="resume-confirm-modal"
          className="absolute left-1/2 -translate-x-1/2 mt-2 p-4 bg-white border rounded shadow"
        >
          <p className="mb-2">Are you sure you want to resume trading?</p>
          <div className="space-x-2 text-right">
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => {
                setConfirmResume(false);
                submitResume(false);
              }}
            >
              Confirm
            </button>
            <button
              className="bg-gray-300 px-3 py-1 rounded"
              onClick={() => setConfirmResume(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {confirmOverride && (
        <div
          data-testid="resume-confirm-modal"
          className="absolute left-1/2 -translate-x-1/2 mt-2 p-4 bg-white border rounded shadow"
        >
          <p className="mb-2">Risk thresholds still breached. Resume anyway?</p>
          <div className="space-x-2 text-right">
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => submitResume(true)}
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
