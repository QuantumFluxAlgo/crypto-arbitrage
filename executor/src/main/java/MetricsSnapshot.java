package executor;

/** Immutable snapshot of Executor performance metrics. */
public class MetricsSnapshot {
    public final int tradeCount;
    public final int winCount;
    public final long totalLatencyMs;
    public final double averageLatencyMs;
    public final double winRate;

    public MetricsSnapshot(int tradeCount, int winCount, long totalLatencyMs, double averageLatencyMs, double winRate) {
        this.tradeCount = tradeCount;
        this.winCount = winCount;
        this.totalLatencyMs = totalLatencyMs;
        this.averageLatencyMs = averageLatencyMs;
        this.winRate = winRate;
    }
}
