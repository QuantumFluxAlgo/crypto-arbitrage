import React, { useEffect, useState } from 'react';

export default function AdminPanel() {
  const [logs, setLogs] = useState([]);
  const [model, setModel] = useState({ current: '', previous: '' });
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const resLogs = await fetch('/api/audit');
        if (resLogs.ok) {
          const data = await resLogs.json();
          setLogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      }

      try {
        const resModel = await fetch('/api/models/version');
        if (resModel.ok) {
          const data = await resModel.json();
          setModel({ current: data.current, previous: data.previous });
        }
      } catch (err) {
        console.error('Failed to fetch model version', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function rollback() {
    setRollingBack(true);
    try {
      const res = await fetch('/api/models/rollback', { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      alert('Rollback triggered');
    } catch (err) {
      console.error('Rollback failed', err);
      alert('Rollback failed');
    } finally {
      setRollingBack(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-4 text-text">
      <h1 className="text-xl font-semibold">Admin Panel</h1>
      <div className="space-y-2">
        <div>Current Model: {model.current}</div>
        <div>Previous Model: {model.previous}</div>
        <button
          className="p-2 bg-red-600 text-white rounded"
          onClick={rollback}
          disabled={rollingBack}
        >
          Rollback Model
        </button>
      </div>
      <table className="min-w-full text-sm text-left">
        <thead className="text-gray-400">
          <tr>
            <th className="px-2 py-1">Action</th>
            <th className="px-2 py-1">User</th>
            <th className="px-2 py-1">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="odd:bg-background even:bg-surface">
              <td className="px-2 py-1">{log.action}</td>
              <td className="px-2 py-1">{log.user}</td>
              <td className="px-2 py-1">{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
