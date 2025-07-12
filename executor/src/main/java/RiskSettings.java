package executor;

/**
 * Holds risk-related configuration values and computes trade sizes
 * based on the configured exposure cap.
 */
public class RiskSettings {
    private final double startingBalance;
    private final double coinCapPct;
    private final double maxBookDepthUsd;

    /**
     * Load risk configuration from environment variables.
     */
    public RiskSettings() {
        this.startingBalance = Double.parseDouble(
                System.getenv().getOrDefault("STARTING_BALANCE", "10000"));
        this.coinCapPct = Double.parseDouble(
                System.getenv().getOrDefault("COIN_CAP_PCT", "10"));
        this.maxBookDepthUsd = Double.parseDouble(
                System.getenv().getOrDefault("MAX_BOOK_DEPTH_USD", "2000"));
    }

    /**
     * Create settings with explicit values. Primarily used for tests.
     */
    public RiskSettings(double startingBalance, double coinCapPct, double maxBookDepthUsd) {
        this.startingBalance = startingBalance;
        this.coinCapPct = coinCapPct;
        this.maxBookDepthUsd = maxBookDepthUsd;
    }

    /**
     * Compute trade size in USD based on the current NAV and
     * the per-coin exposure cap percentage.
     *
     * @return trade size value
     */
    public double computeTradeSize() {
        double nav = startingBalance + ProfitTracker.getGlobalTotal();
        double size = nav * (coinCapPct / 100.0);
        return Math.min(size, maxBookDepthUsd);
    }

    /**
     * @return maximum order book depth in USD this bot will attempt to fill
     */
    public double getMaxBookDepthUsd() {
        return maxBookDepthUsd;
    }
}

