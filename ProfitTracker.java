public class ProfitTracker {
    private double cumulativeProfit = 0.0;

    /**
     * Record profit or loss from a single trade. This value will be added
     * to the cumulative profit total.
     *
     * @param pnl profit (positive) or loss (negative) from the trade
     */
    public void recordTrade(double pnl) {
        cumulativeProfit += pnl;
    }

    /**
     * Retrieve the cumulative profit across all recorded trades.
     *
     * @return total profit
     */
    public double getCumulativeProfit() {
        return cumulativeProfit;
    }
}
