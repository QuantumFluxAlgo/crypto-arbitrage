import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export default function LiveMetrics({ equity = [], latency = [] }) {
  const data = equity.map((val, i) => ({
    time: i,
    equity: val,
    latency: latency[i] ?? null,
  }));

  return (
    <div className="grid gap-4 bg-background text-text p-4 rounded">
      <h2 className="text-lg font-semibold">Live Metrics</h2>
      <div className="w-full h-64 bg-surface p-2 rounded">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#ACB0BD" />
            <YAxis stroke="#ACB0BD" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="equity" stroke="#00C8A0" dot={false} />
            <Line type="monotone" dataKey="latency" stroke="#416165" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
