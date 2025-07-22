package executor;

/**
 * Result of executing a trade.
 */
public class TradeResult {
    public final boolean success;
    public final double pnl;
    public final long latencyMs;
    /** Trade status string e.g. FILLED, FAILED, PARTIAL_ABORTED */
    public final String status;

    /**
     * @param success  whether the trade succeeded
     * @param pnl      realised profit/loss
     * @param latencyMs latency in milliseconds
     */
    public TradeResult(boolean success, double pnl, long latencyMs) {
        this(success, pnl, latencyMs, success ? "FILLED" : "FAILED");
    }

    public TradeResult(boolean success, double pnl, long latencyMs, String status) {
        this.success = success;
        this.pnl = pnl;
        this.latencyMs = latencyMs;
        this.status = status;
    }
}

