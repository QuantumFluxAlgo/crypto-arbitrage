package executor;

/**
 * Utility class that determines when trading should halt based on a few
 * safety thresholds.  All thresholds are fixed and checked in the static
 * {@link #shouldHalt(double, double, double)} method.
 */
public class PanicBrake {
    /**
     * Returns {@code true} when any of the safety thresholds are breached.
     *
     * @param dailyLossPct percentage of daily loss
     * @param avgLatencyMs average latency in milliseconds
     * @param winRate      overall win rate
     * @return {@code true} if trading should halt
     */

    public static boolean shouldHalt(double dailyLossPct, double avgLatencyMs, double winRate) {
        return dailyLossPct > 3.0 || avgLatencyMs > 500.0 || winRate < 0.4;
    }
}

