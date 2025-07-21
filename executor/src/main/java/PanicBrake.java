// Halts trading when loss or latency exceed limits
package executor;

/**
 * Utility class that determines when trading should halt based on a few
 * safety thresholds.  All thresholds are fixed and checked in the static
 * {@link #shouldHalt(RedisClient, Config, double, double, double)} method.
 */
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import executor.ProfitTracker;
import executor.RedisClient;
import executor.Config;

public class PanicBrake {
    private static final Logger logger = LoggerFactory.getLogger(PanicBrake.class);

    /**
     * Returns {@code true} when any of the safety thresholds are breached.
     *
     * @param dailyLossPct percentage of daily loss
     * @param avgLatencyMs average latency in milliseconds
     * @param winRate      overall win rate
     * @return {@code true} if trading should halt
     */

    private static double getLossCapPct() {
        String val = System.getProperty("LOSS_CAP_PCT",
                System.getenv().getOrDefault("LOSS_CAP_PCT", "3.0"));
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return 3.0;
        }
    }

    private static double getLatencyMaxMs() {
        String val = System.getProperty("LATENCY_MAX_MS",
                System.getenv().getOrDefault("LATENCY_MAX_MS", "500.0"));
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return 500.0;
        }
    }

    private static double getWinRateThreshold() {
        String val = System.getProperty("WIN_RATE_THRESHOLD",
                System.getenv().getOrDefault("WIN_RATE_THRESHOLD", "0.4"));
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return 0.4;
        }
    }

    private static double getProfitTargetUsd() {
        String val = System.getProperty("PROFIT_TARGET_USD",
                System.getenv().getOrDefault("PROFIT_TARGET_USD", "0.0"));
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    public static boolean shouldHalt(RedisClient redis, Config config,
                                     double dailyLossPct, double avgLatencyMs, double winRate) {
        double lossCap = getLossCapPct();
        double latencyCap = getLatencyMaxMs();
        double winRateThresh = getWinRateThreshold();
        double profitTarget = getProfitTargetUsd();
        double profitSoFar = ProfitTracker.getCumulativeProfit();

        boolean triggered = false;

        if (dailyLossPct > lossCap) {
            logger.warn("PANIC BRAKE TRIGGERED: loss {}% > {}%", dailyLossPct, lossCap);
            triggered = true;
        } else if (avgLatencyMs > latencyCap) {
            logger.warn("PANIC BRAKE TRIGGERED: latency {}ms > {}ms", avgLatencyMs, latencyCap);
            triggered = true;
        } else if (winRate < winRateThresh) {
            logger.warn("PANIC BRAKE TRIGGERED: winRate {} < {}", winRate, winRateThresh);
            triggered = true;
        } else if (profitTarget > 0 && profitSoFar >= profitTarget) {
            logger.warn("PANIC BRAKE TRIGGERED: profit {} >= target {}", profitSoFar, profitTarget);
            triggered = true;
        }

        if (triggered && redis != null) {
            redis.publishControl(config, "pause");
        }

        return triggered;
    }
}

