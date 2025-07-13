import React, { useEffect } from 'react';

function Dashboard({ metrics }) {
  useEffect(() => {
    fetch('/api/metrics')
      .then((res) => res.json())
      .then((data) => console.log('Fetched /api/metrics', data))
      .catch((err) => console.error('Error fetching metrics', err));
  }, []);

  useEffect(() => {
    if (metrics) {
      console.log('Metrics received', metrics);
    }
  }, [metrics]);

  return (
    <div>
      {/* dashboard content */}
    </div>
  );
}

export default Dashboard;
