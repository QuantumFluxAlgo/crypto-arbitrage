import React from 'react';
import { useConsistency } from './useConsistency';
import { formatConsistency } from './format';

export interface ConsistencyCardProps {
  endpoint?: string;   // default '/report/consistency'
  windowSize?: number; // default 8
  title?: string;      // default 'Payout Consistency'
}

export function ConsistencyCard(props: ConsistencyCardProps) {
  const endpoint = props.endpoint ?? '/report/consistency';
  const windowSize = props.windowSize ?? 8;
  const title = props.title ?? 'Payout Consistency';
  const { data, status, error } = useConsistency(endpoint, windowSize);

  const box: React.CSSProperties = {
    border: '1px solid #e5e7eb', borderRadius: 12, padding: 16,
    display: 'flex', flexDirection: 'column', gap: 8, background: '#fff'
  };
  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12 };
  const pill = (ok: boolean): React.CSSProperties => ({
    padding: '2px 8px', borderRadius: 999, fontSize: 12,
    color: ok ? '#065f46' : '#991b1b',
    background: ok ? '#d1fae5' : '#fee2e2',
    border: `1px solid ${ok ? '#10b981' : '#ef4444'}`
  });
  const sub: React.CSSProperties = { color: '#6b7280', fontSize: 12 };

  if (status === 'loading' || status === 'idle') {
    return <div style={box}><div style={row}><strong>{title}</strong><span style={sub}>Loading…</span></div></div>;
  }
  if (status === 'error') {
    return <div style={box}><div style={row}><strong>{title}</strong><span style={sub}>Error</span></div><code style={{fontSize:12,color:'#991b1b'}}>{error}</code></div>;
  }
  if (status === 'empty' || !data) {
    return <div style={box}>
      <div style={row}><strong>{title}</strong><span style={pill(false)}>No Data</span></div>
      <div style={sub}>Add daily PnL to <code>var/pnl/daily.json</code> to see eligibility.</div>
    </div>;
  }

  const f = formatConsistency(data);
  const list: React.CSSProperties = { listStyle: 'none', padding: 0, margin: 0, display:'grid', gap:6 };

  return (
    <div style={box}>
      <div style={row}>
        <strong>{title}</strong>
        <span style={pill(data.eligible)}>{f.eligibleText}</span>
      </div>

      <ul style={list}>
        <li style={row}><span>Total PnL (last {data.window}d)</span><strong>{f.totalPnLText}</strong></li>
        <li style={row}><span>Best Day % of Total</span><strong>{f.bestDayPctText}</strong></li>
        <li style={row}><span>Profit Days</span><strong>{f.profitDaysText}</strong></li>
      </ul>

      {data.days?.length ? (
        <div style={{marginTop:8}}>
          <div style={sub}>Recent PnL</div>
          <ul style={{...list, gridTemplateColumns:'repeat(4, minmax(0,1fr))'}}>
            {data.days.slice(-8).map(d => (
              <li key={d.date} style={{ textAlign:'center', padding:6, border:'1px solid #e5e7eb', borderRadius:8, background:'#f9fafb' }}>
                <div style={{fontSize:12, color:'#6b7280'}}>{d.date.slice(5)}</div>
                <div style={{fontWeight:600, color: d.pnl>=0 ? '#065f46' : '#991b1b'}}>
                  {d.pnl>=0 ? '+' : '-'}${Math.abs(d.pnl).toFixed(0)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default ConsistencyCard;
