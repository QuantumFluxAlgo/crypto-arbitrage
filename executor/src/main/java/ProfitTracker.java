public class ProfitTracker {
    private static double globalTotal = 0.0;
    private static double dailyTotal = 0.0;

    /**
     * Record profit or loss from a trade.
     * Updates both the daily total and the global total.
     *
     * @param pnl profit (positive) or loss (negative)
     */
    public static void record(double pnl) {
        dailyTotal += pnl;
        globalTotal += pnl;
    }

    /**
     * Get today's loss as a percentage of starting capital.
     * For simplicity we assume a fixed starting balance of $10,000.
     *
     * @param pnl profit (positive) or loss (negative)
     */
    public static double getDailyLossPct() {
        double startingBalance = 10_000.0;
        if (dailyTotal >= 0) {
            return 0.0;
        }
        return (-dailyTotal / startingBalance) * 100.0;
    }

    /**
     * Get the global total profit recorded.
     *
     * @return global profit
     */
    public static double getGlobalTotal() {
        return globalTotal;
    }
}

