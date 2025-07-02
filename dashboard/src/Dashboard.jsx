import React, { useEffect } from 'react';

function Dashboard({ metrics }) {
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
