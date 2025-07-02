import { useEffect, useState } from "react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);

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

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Live Dashboard</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {metrics ? JSON.stringify(metrics, null, 2) : 'Loading...'}
      </pre>
    </div>
  );
}
