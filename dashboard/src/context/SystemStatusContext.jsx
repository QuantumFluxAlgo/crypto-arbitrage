import React, { createContext, useContext, useEffect, useState } from 'react';

const SystemStatusContext = createContext({ panic: false, reason: '' });

export const useSystemStatus = () => useContext(SystemStatusContext);

export function SystemStatusProvider({ children }) {
  const [panic, setPanic] = useState(false);
  const [reason, setReason] = useState('');

  async function fetchStatus() {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const data = await res.json();
        setPanic(Boolean(data.panic));
        setReason(data.reason || '');
      }
    } catch (err) {
      console.error('Failed to fetch system status', err);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <SystemStatusContext.Provider value={{ panic, reason, refreshStatus: fetchStatus }}>
      {children}
    </SystemStatusContext.Provider>
  );
}
