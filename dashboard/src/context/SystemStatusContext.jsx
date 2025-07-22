// Shares panic brake status across components
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSystemStatus } from '../utils/api.js';

const SystemStatusContext = createContext({ panic: false, reason: '' });

export { SystemStatusContext };

export const useSystemStatus = () => useContext(SystemStatusContext);

export function SystemStatusProvider({ children }) {
  const [panic, setPanic] = useState(false);
  const [reason, setReason] = useState('');

  // Poll API for current panic state
  async function fetchStatus() {
    try {
      const data = await fetchSystemStatus();
      setPanic(Boolean(data.paused));
      setReason(data.panic_reason || '');
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
