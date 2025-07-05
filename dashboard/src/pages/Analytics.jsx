import React, { useState, useEffect } from 'react';

function scale(data, width, height) {
  const minX = Math.min(...data.map((d) => d.x));
  const maxX = Math.max(...data.map((d) => d.x));
  const minY = Math.min(...data.map((d) => d.y));
  const maxY = Math.max(...data.map((d) => d.y));
  const sx = (v) => ((v - minX) / (maxX - minX || 1)) * width;
  const sy = (v) => height - ((v - minY) / (maxY - minY || 1)) * height;
  return { sx, sy };
}

function AreaChart({ data, width = 600, height = 200 }) {
  if (!data.length) return null;
  const { sx, sy } = scale(data, width, height);
  const line = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'}${sx(d.x)},${sy(d.y)}`)
    .join('');
  const area = `${line} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className="w-full">
      <path d={area} fill="rgba(34,197,94,0.3)" />
      <path d={line} fill="none" stroke="#22c55e" strokeWidth="2" />
    </svg>
  );
}

function LineChart({ series, width = 600, height = 200, colors = [] }) {
  const all = series.flatMap((s) => s.data);
  if (!all.length) return null;
  const { sx, sy } = scale(all, width, height);
  return (
    <svg width={width} height={height} className="w-full">
      {series.map((s, i) => {
        const path = s.data
          .map((d, j) => `${j === 0 ? 'M' : 'L'}${sx(d.x)},${sy(d.y)}`)
          .join('');
        const color = colors[i] || '#60a5fa';
        return (
          <path key={i} d={path} fill="none" stroke={color} strokeWidth="2" />
        );
      })}
    </svg>
  );
}

export default function Analytics() {
  const [trades, setTrades] = useState([]);
  const [preds, setPreds] = useState([]);
  const [pnlSeries, setPnlSeries] = useState([]);
  const [stats, setStats] = useState({ sharpe: 0, winRate: 0 });

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/trades/history');
        if (res.ok) {
          const data = await res.json();
          data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setTrades(data);
          const pnls = data.map((t) => t.pnl);
          let cum = 0;
          const series = data.map((t) => {
            cum += t.pnl;
            return { x: new Date(t.timestamp).getTime(), y: cum };
          });
          setPnlSeries(series);
          const winRate =
            pnls.filter((p) => p > 0).length / (pnls.length || 1) * 100;
          const mean = pnls.reduce((a, b) => a + b, 0) / (pnls.length || 1);
          const std = Math.sqrt(
            pnls.reduce((s, p) => s + (p - mean) ** 2, 0) / (pnls.length || 1)
          );
          const sharpe = std ? (mean / std) * Math.sqrt(pnls.length) : 0;
          setStats({ sharpe, winRate });
        } else {
          console.error('Failed to fetch trade history');
        }
      } catch (err) {
        console.error('Error fetching trade history', err);
      }
    }

    async function fetchPredictions() {
      try {
        const res = await fetch('/api/predictions');
        if (res.ok) {
          const data = await res.json();
          data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setPreds(data);
        }
      } catch (err) {
        console.error('Failed to fetch predictions', err);
      }
    }

    fetchHistory();
    fetchPredictions();
  }, []);

  const predictionSeries = [
    {
      label: 'Predicted',
      data: preds.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.predicted })),
    },
    {
      label: 'Actual',
      data: preds.map((p) => ({ x: new Date(p.timestamp).getTime(), y: p.actual })),
    },
  ];

  return (
    <div className="space-y-6 p-4 text-text">
      <h1 className="text-xl font-semibold">Analytics</h1>
      <div className="rounded bg-surface p-4">
        <h2 className="mb-2 font-medium">Rolling PnL</h2>
        <AreaChart data={pnlSeries} />
        <div className="mt-2 flex space-x-4 text-sm">
          <div>Sharpe Ratio: {stats.sharpe.toFixed(2)}</div>
          <div>Win Rate: {stats.winRate.toFixed(1)}%</div>
        </div>
      </div>

      <div className="rounded bg-surface p-4">
        <h2 className="mb-2 font-medium">LSTM Predictions</h2>
        <LineChart
          series={predictionSeries}
          colors={["#3b82f6", "#ef4444"]}
        />
      </div>
    </div>
  );
}
