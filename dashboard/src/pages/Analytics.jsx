import React, { useState, useEffect } from 'react';

export default function Analytics() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/trades/history');
        if (res.ok) {
          const data = await res.json();
          data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setTrades(data);
        } else {
          console.error('Failed to fetch trade history');
        }
      } catch (err) {
        console.error('Error fetching trade history', err);
      }
    }

    fetchHistory();
  }, []);

  return (
    <div className="p-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pair
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PnL
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {trades.map((trade, idx) => (
            <tr key={idx}>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(trade.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{trade.pair}</td>
              <td className="px-6 py-4 whitespace-nowrap">{trade.pnl.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
