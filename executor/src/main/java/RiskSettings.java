package executor;

/**
 * Holds risk-related configuration values and computes trade sizes
 * based on the configured exposure cap.
 */
public class RiskSettings {
    private final double startingBalance;
    private final double coinCapPct;

    public RiskSettings() {
        this.startingBalance = Double.parseDouble(
                System.getenv().getOrDefault("STARTING_BALANCE", "10000"));
        this.coinCapPct = Double.parseDouble(
                System.getenv().getOrDefault("COIN_CAP_PCT", "10"));
    }

    /**
     * Compute trade size in USD based on the current NAV and
     * the per-coin exposure cap percentage.
     *
     * @return trade size value
     */
    public double computeTradeSize() {
        double nav = startingBalance + ProfitTracker.getGlobalTotal();
        return nav * (coinCapPct / 100.0);
    }
}

