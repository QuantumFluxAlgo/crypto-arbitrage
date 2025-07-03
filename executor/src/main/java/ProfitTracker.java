public class ProfitTracker {
    private static double globalTotal = 0.0;
    private double cumulativeProfit = 0.0;

    /**
     * Record profit or loss from a trade (instance-level).
     *
     * @param pnl profit (positive) or loss (negative)
     */
    public void record(double pnl) {
        cumulativeProfit += pnl;
    }

    /**
     * Get the cumulative profit for this instance.
     *
     * @return instance-level profit
     */
    public double getTotal() {
        return cumulativeProfit;
    }

    /**
     * Record profit or loss globally (static-level).
     *
     * @param pnl profit (positive) or loss (negative)
     */
    public static void recordGlobal(double pnl) {
        globalTotal += pnl;
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

