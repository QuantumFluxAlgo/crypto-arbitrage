package executor;

public class TradeResult {
    public final boolean success;
    public final double pnl;
    public final long latencyMs;

    public TradeResult(boolean success, double pnl, long latencyMs) {
        this.success = success;
        this.pnl = pnl;
        this.latencyMs = latencyMs;
    }
}

