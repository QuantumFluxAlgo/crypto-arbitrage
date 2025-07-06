import React, { useEffect, useState, useRef } from 'react';
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

export default function SimulationOverlay() {
  const [points, setPoints] = useState([]);
  const [recent, setRecent] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const url = `ws://${window.location.host}/api/simulation`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        const { timestamp, confidence, latency, pnl } = msg;
        setPoints((prev) => {
          const next = [...prev, { time: new Date(timestamp).toLocaleTimeString(), confidence, latency, pnl }];
          return next.slice(-100);
        });
        setRecent((prev) => {
          const next = [{ time: new Date(timestamp).toLocaleTimeString(), confidence, latency, pnl }, ...prev];
          return next.slice(0, 10);
        });
      } catch (err) {
        console.error('bad ws message', err);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="grid gap-4 bg-background text-text p-4 rounded">
      <h2 className="text-lg font-semibold">Simulated Opportunities</h2>
      <div className="w-full h-64 bg-surface p-2 rounded">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid stroke="#444" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#ACB0BD" />
            <YAxis stroke="#ACB0BD" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="confidence" stroke="#00C8A0" dot={false} />
            <Line type="monotone" dataKey="latency" stroke="#416165" dot={false} />
            <Line type="monotone" dataKey="pnl" stroke="#FF5C5C" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="overflow-auto bg-surface rounded">
        <table className="min-w-full text-sm">
          <thead className="text-gray-400">
            <tr>
              <th className="px-2 py-1">Time</th>
              <th className="px-2 py-1">Confidence</th>
              <th className="px-2 py-1">Latency</th>
              <th className="px-2 py-1">PnL</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r, i) => (
              <tr key={i} className={i % 2 ? 'bg-surface' : 'bg-background'}>
                <td className="px-2 py-1">{r.time}</td>
                <td className="px-2 py-1">{r.confidence.toFixed(2)}</td>
                <td className="px-2 py-1">{r.latency}</td>
                <td className="px-2 py-1">{r.pnl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
