package executor;

/**
 * Utility class that determines when trading should halt based on a few
 * safety thresholds.  All thresholds are fixed and checked in the static
 * {@link #shouldHalt(double, double, double)} method.
 */
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    public static boolean shouldHalt(double dailyLossPct, double avgLatencyMs, double winRate) {
        double lossCap = getLossCapPct();
        double latencyCap = getLatencyMaxMs();
        double winRateThresh = getWinRateThreshold();

        if (dailyLossPct > lossCap) {
            logger.warn("PANIC BRAKE TRIGGERED: loss {}% > {}%", dailyLossPct, lossCap);
            return true;
        }
        if (avgLatencyMs > latencyCap) {
            logger.warn("PANIC BRAKE TRIGGERED: latency {}ms > {}ms", avgLatencyMs, latencyCap);
            return true;
        }
        if (winRate < winRateThresh) {
            logger.warn("PANIC BRAKE TRIGGERED: winRate {} < {}", winRate, winRateThresh);
            return true;
        }
        return false;
    }
}

