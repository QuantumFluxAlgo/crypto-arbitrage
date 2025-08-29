import { describe, it, expect } from 'vitest';
import { formatConsistency, percent } from '../src/format';

describe('formatConsistency', () => {
  it('formats eligible, totals and ratios', () => {
    const r = formatConsistency({
      window: 8,
      totalPnL: 1420,
      bestDayPnL: 410,
      bestDayShare: 410/1420,
      profitDayCount: 7,
      eligible: true,
      days: []
    } as any);
    expect(r.eligibleText).toBe('Eligible');
    expect(r.totalPnLText).toBe('$1420.00');
    expect(r.bestDayPctText).toBe('28.9%');
    expect(r.profitDaysText).toBe('7/8');
  });

  it('percent helper', () => {
    expect(percent(0.3)).toBe('30.0%');
    expect(percent(NaN)).toBe('0%');
  });
});
