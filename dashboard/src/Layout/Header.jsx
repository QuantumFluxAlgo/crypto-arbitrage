import React, { useEffect, useState } from 'react';

export default function Header() {
  const [sandbox, setSandbox] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSandbox(Boolean(data.sandbox_mode));
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    }

    fetchSettings();
  }, []);

  return (
    <header className="relative">
      {sandbox && (
        <div className="absolute right-2 top-2 bg-error text-white px-3 py-1 rounded">
          SANDBOX MODE - FAKE DATA
        </div>
      )}
    </header>
  );
}
