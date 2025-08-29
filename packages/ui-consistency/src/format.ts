import type { ConsistencyResult } from './types';

export function percent(n: number, decimals = 1): string {
  if (!Number.isFinite(n)) return '0%';
  return `${(n * 100).toFixed(decimals)}%`;
}

export function formatConsistency(r: ConsistencyResult) {
  return {
    eligibleText: r.eligible ? 'Eligible' : 'Not eligible',
    totalPnLText: currency(r.totalPnL),
    bestDayPctText: percent(r.bestDayPnL > 0 && r.totalPnL > 0 ? r.bestDayPnL / r.totalPnL : 0),
    profitDaysText: `${r.profitDayCount}/${r.window}`,
  };
}

function currency(n: number): string {
  const sign = n < 0 ? '-' : '';
  const v = Math.abs(n);
  return `${sign}$${v.toFixed(2)}`;
}
