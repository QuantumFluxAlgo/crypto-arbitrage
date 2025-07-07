package executor;

public class ConfigValidator {

    private final double lossCapPct;
    private final double latencyMaxMs;
    private final double winRateThreshold;

    public ConfigValidator(double lossCapPct, double latencyMaxMs, double winRateThreshold) {
        this.lossCapPct = lossCapPct;
        this.latencyMaxMs = latencyMaxMs;
        this.winRateThreshold = winRateThreshold;
    }

    public void validate() {
        if (lossCapPct > 10.0) {
            throw new RuntimeException("LOSS_CAP_PCT exceeds safe limit: " + lossCapPct + " > 10%");
        }
        if (latencyMaxMs > 500.0) {
            throw new RuntimeException("LATENCY_MAX_MS exceeds safe limit: " + latencyMaxMs + "ms > 500ms");
        }
        if (winRateThreshold < 0.4) {
            throw new RuntimeException("WIN_RATE_THRESHOLD is too low: " + winRateThreshold + " < 0.4");
        }

        System.out.println("[VALIDATOR] Configs validated: OK");
    }
}

