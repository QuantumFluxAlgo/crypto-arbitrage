package executor;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Scheduler that resets daily profit totals at midnight.
 */
public class DailyResetScheduler {
    private static final Logger logger = LoggerFactory.getLogger(DailyResetScheduler.class);
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    /** Start the reset job. */
    public void start() {
        long delay = secondsUntilMidnight();
        scheduler.scheduleAtFixedRate(this::runOnce, delay, 24 * 60 * 60, TimeUnit.SECONDS);
    }

    /** Compute seconds until the next midnight. */
    static long secondsUntilMidnight() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next = now.plusDays(1).toLocalDate().atStartOfDay();
        return Duration.between(now, next).getSeconds();
    }

    /** Perform a single reset. */
    void runOnce() {
        logger.info("Resetting daily profit totals");
        ProfitTracker.resetDailyTotals();
    }

    /** Stop the scheduled task. */
    public void stop() {
        scheduler.shutdownNow();
    }
}
