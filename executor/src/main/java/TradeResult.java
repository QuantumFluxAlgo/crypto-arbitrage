package executor;

/**
 * Result of executing a trade.
 */
public class TradeResult {
    public final boolean success;
    public final double pnl;
    public final long latencyMs;

    /**
     * @param success  whether the trade succeeded
     * @param pnl      realised profit/loss
     * @param latencyMs latency in milliseconds
     */
    public TradeResult(boolean success, double pnl, long latencyMs) {
        this.success = success;
        this.pnl = pnl;
        this.latencyMs = latencyMs;
    }
}

