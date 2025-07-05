import { useEffect, useState } from "react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState('');

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/metrics');
        const data = await res.json();
        console.log('Metrics:', data);
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load metrics', err);
      }
    }

    loadMetrics();
  }, []);

  async function handleResume() {
    setResuming(true);
    setResumeError('');
    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Resume failed');
      await res.json();
      alert('Trading resumed');
    } catch (err) {
      console.error('Resume failed', err);
      setResumeError('Failed to resume');
    } finally {
      setResuming(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Live Dashboard</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {metrics ? JSON.stringify(metrics, null, 2) : 'Loading...'}
      </pre>
      <button
        className="p-2 bg-green-600 text-white rounded"
        onClick={handleResume}
        disabled={resuming}
      >
        Resume Trading
      </button>
      {resumeError && <div className="text-red-500">{resumeError}</div>}
    </div>
  );
}
