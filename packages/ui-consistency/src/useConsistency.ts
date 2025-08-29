import { useEffect, useState } from 'react';
import type { ConsistencyResult } from './types';

export function useConsistency(endpoint = '/report/consistency', windowSize = 8) {
  const [data, setData] = useState<ConsistencyResult | null>(null);
  const [status, setStatus] = useState<'idle'|'loading'|'ok'|'empty'|'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      setStatus('loading');
      setError(null);
      try {
        const res = await fetch(`${endpoint}?window=${windowSize}`, { method: 'GET' });
        if (res.status === 204) {
          if (alive) { setStatus('empty'); setData(null); }
          return;
        }
        if (!res.ok) {
          const txt = await res.text().catch(() => res.statusText);
          throw new Error(txt || `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (alive) { setData(json); setStatus('ok'); }
      } catch (e:any) {
        if (alive) { setError(String(e?.message ?? e)); setStatus('error'); }
      }
    }
    run();
    return () => { alive = false; };
  }, [endpoint, windowSize]);

  return { data, status, error };
}
