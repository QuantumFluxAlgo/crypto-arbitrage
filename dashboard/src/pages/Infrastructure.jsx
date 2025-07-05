import React, { useEffect, useState } from 'react';

export default function Infrastructure() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/infra/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (err) {
        console.error('Failed to fetch infra status', err);
      }
    }

    load();
  }, []);

  if (!status) return <div>Loading...</div>;

  const gpuCirc = 2 * Math.PI * 28;
  const gpuDash = (status.gpu / 100) * gpuCirc;

  return (
    <div className="space-y-6 p-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pod</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {status.pods.map(pod => (
            <tr key={pod.name}>
              <td className="px-6 py-4 whitespace-nowrap">{pod.name}</td>
              <td className={`px-6 py-4 whitespace-nowrap ${pod.status === 'Running' ? 'text-teal-600' : 'text-red-600'}`}>{pod.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center space-x-8">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r="28"
            stroke="currentColor"
            strokeWidth="8"
            className="text-gray-300"
            fill="none"
          />
          <circle
            cx="36"
            cy="36"
            r="28"
            stroke="currentColor"
            strokeWidth="8"
            className="text-teal-600"
            fill="none"
            strokeDasharray={`${gpuDash} ${gpuCirc}`}
            transform="rotate(-90 36 36)"
            strokeLinecap="round"
          />
          <text x="36" y="38" textAnchor="middle" className="text-sm fill-teal-700">
            {status.gpu}%
          </text>
        </svg>
        <div className="space-y-2">
          <div>
            DB:
            <span className={status.db ? 'text-teal-600 ml-1' : 'text-red-600 ml-1'}>
              {status.db ? '✓' : '✗'}
            </span>
          </div>
          <div>
            Redis:
            <span className={status.redis ? 'text-teal-600 ml-1' : 'text-red-600 ml-1'}>
              {status.redis ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
