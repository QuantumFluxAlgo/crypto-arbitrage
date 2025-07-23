// Safety validator rejecting aggressive settings
package executor;

/**
 * Validates runtime configuration values for safety.
 * Thresholds are intentionally conservative to avoid
 * risky behaviour when running the executor.
 */
public class ConfigValidator {

    private final double lossCapPct;
    private final double latencyMaxMs;
    private final double winRateThreshold;
    private final double maxSlippagePct;
    private final double profitTargetUsd;

    /**
     * Construct a validator with the provided thresholds.
     *
     * @param lossCapPct       maximum allowed daily loss percentage
     * @param latencyMaxMs     maximum acceptable latency in milliseconds
     * @param winRateThreshold minimum win rate before triggering alerts
     */
    public ConfigValidator(double lossCapPct, double latencyMaxMs, double winRateThreshold,
                           double maxSlippagePct, double profitTargetUsd) {
        this.lossCapPct = lossCapPct;
        this.latencyMaxMs = latencyMaxMs;
        this.winRateThreshold = winRateThreshold;
        this.maxSlippagePct = maxSlippagePct;
        this.profitTargetUsd = profitTargetUsd;
    }

    /**
     * Validate the configured thresholds and throw a RuntimeException
     * if any value is deemed unsafe.
     */
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
        if (maxSlippagePct < 0.0 || maxSlippagePct > 5.0) {
            throw new RuntimeException("MAX_SLIPPAGE_PCT out of range: " + maxSlippagePct + " (0-5%)");
        }
        if (profitTargetUsd > 20000.0) {
            throw new RuntimeException("PROFIT_TARGET_USD exceeds safe limit: " + profitTargetUsd + " > 20000");
        }

        System.out.println("[VALIDATOR] Configs validated: OK");
    }
}

