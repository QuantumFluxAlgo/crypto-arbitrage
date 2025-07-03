package safety;

/**
 * Utility class that determines when trading should halt based on a few
 * safety thresholds.  All thresholds are fixed and checked in the static
 * {@link #shouldHalt(float, float, float)} method.
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

    public static boolean shouldHalt(float dailyLossPct, float avgLatencyMs, float winRate) {
        return dailyLossPct > 3 || avgLatencyMs > 500 || winRate < 0.4;
    }
}

