package executor;

import java.time.LocalDate;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Periodically evaluates profit thresholds and triggers a cold wallet sweep
 * based on the configured cadence.
 */
public class ColdSweepScheduler {
    private static final Logger logger = LoggerFactory.getLogger(ColdSweepScheduler.class);

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final ColdSweeper sweeper;
    private final Supplier<String> cadenceSupplier;
    private final Supplier<Double> profitSupplier;
    private final Supplier<Double> capitalSupplier;
    private final String address;

    public ColdSweepScheduler(ColdSweeper sweeper,
                              Supplier<String> cadenceSupplier,
                              Supplier<Double> profitSupplier,
                              Supplier<Double> capitalSupplier,
                              String address) {
        this.sweeper = sweeper;
        this.cadenceSupplier = cadenceSupplier;
        this.profitSupplier = profitSupplier;
        this.capitalSupplier = capitalSupplier;
        this.address = address;
    }

    /** Start the daily evaluation job. */
    public void start() {
        scheduler.scheduleAtFixedRate(this::runOnce, 0, 1, TimeUnit.DAYS);
    }

    /** Evaluate thresholds and sweep if eligible. */
    public void runOnce() {
        runOnce(LocalDate.now());
    }

    /**
     * Internal run method with injectable date for testing.
     */
    void runOnce(LocalDate today) {
        String cadence = cadenceSupplier.get();
        if (cadence == null || cadence.equalsIgnoreCase("None")) {
            return;
        }
        if (cadence.equalsIgnoreCase("Monthly") && today.getDayOfMonth() != 1) {
            return;
        }

        double profit = profitSupplier.get();
        double capital = capitalSupplier.get();
        if (sweeper.shouldSweep(profit, capital)) {
            logger.info("Cold sweep triggered");
            sweeper.sweepToColdWallet(address);
        }
    }

    /** Stop the scheduled task. */
    public void stop() {
        scheduler.shutdownNow();
    }
}
