public class ProfitTracker {
    private double cumulativeProfit;

    public void add(double pnl) {
        cumulativeProfit += pnl;
    }

    public double get() {
        return cumulativeProfit;
    }
}
