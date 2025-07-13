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

    public static boolean shouldHalt(double dailyLossPct, double avgLatencyMs, double winRate) {
        if (dailyLossPct > 3.0) {
            logger.warn("PANIC BRAKE TRIGGERED: loss {}% > 3.0%", dailyLossPct);
            return true;
        }
        if (avgLatencyMs > 500.0) {
            logger.warn("PANIC BRAKE TRIGGERED: latency {}ms > 500ms", avgLatencyMs);
            return true;
        }
        if (winRate < 0.4) {
            logger.warn("PANIC BRAKE TRIGGERED: winRate {} < 0.4", winRate);
            return true;
        }
        return false;
    }
}

