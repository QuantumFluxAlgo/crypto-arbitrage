package executor;

/** Configuration object supplying runtime execution mode. */
public class Config {
    private final ExecutionMode executionMode;
    private final double lossCapPct;
    private final double latencyMaxMs;
    private final double winRateThreshold;
    private final double maxSlippagePct;

    public Config(ExecutionMode mode) {
        this.executionMode = mode;
        this.lossCapPct = Double.parseDouble(
                System.getenv().getOrDefault("LOSS_CAP_PCT", "5.0"));
        this.latencyMaxMs = Double.parseDouble(
                System.getenv().getOrDefault("LATENCY_MAX_MS", "250"));
        this.winRateThreshold = Double.parseDouble(
                System.getenv().getOrDefault("WIN_RATE_THRESHOLD", "0.5"));
        this.maxSlippagePct = Double.parseDouble(
                System.getenv().getOrDefault("MAX_SLIPPAGE_PCT", "0.2"));
    }

    public ExecutionMode getExecutionMode() {
        return executionMode;
    }

    public double getLossCapPct() {
        return lossCapPct;
    }

    public double getLatencyMaxMs() {
        return latencyMaxMs;
    }

    public double getWinRateThreshold() {
        return winRateThreshold;
    }

    public double getMaxSlippagePct() {
        return maxSlippagePct;
    }

    /**
     * @return true when running in sandbox/dry-run mode
     */
    public boolean isDryRun() {
        return executionMode == ExecutionMode.SANDBOX;
    }
}
