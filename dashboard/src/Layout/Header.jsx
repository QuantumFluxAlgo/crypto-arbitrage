import React, { useEffect, useState } from 'react';

export default function Header() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setMode(data.mode);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    }

    fetchSettings();
  }, []);

  return (
    <header className="relative">
      {mode === 'DRY_RUN' && (
        <div className="absolute right-2 top-2 bg-error text-white px-3 py-1 rounded">
          Running in DRY_RUN mode
        </div>
      )}
    </header>
  );
}
