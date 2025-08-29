export interface DailyPnL { date: string; pnl: number }
export interface ConsistencyResult {
  window: number;
  totalPnL: number;
  bestDayPnL: number;
  bestDayShare: number; // 0..1
  profitDayCount: number;
  eligible: boolean;
  days: DailyPnL[];
}
