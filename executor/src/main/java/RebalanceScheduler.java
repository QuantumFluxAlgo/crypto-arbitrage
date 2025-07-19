package executor;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Schedules periodic rebalancing using current exchange balances.
 */
public class RebalanceScheduler {
    private static final Logger logger = LoggerFactory.getLogger(RebalanceScheduler.class);

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final Rebalancer rebalancer;
    private final Map<String, ExchangeAdapter> adapters;

    /**
     * Create a scheduler that delegates to the given rebalancer.
     *
     * @param rebalancer rebalancer instance
     * @param adapters   mapping of exchange name to adapter
     */
    public RebalanceScheduler(Rebalancer rebalancer, Map<String, ExchangeAdapter> adapters) {
        this.rebalancer = rebalancer;
        this.adapters = adapters;
    }

    
    /** Start the rebalance job with a configurable interval. */
    public void start() {
        scheduler.scheduleAtFixedRate(this::runOnce, 0,
                getIntervalMinutes(), TimeUnit.MINUTES);
    }

    /**
     * Determine the rebalance interval in minutes.
     * Uses system property or environment variable
     * {@code REBALANCE_INTERVAL_MINUTES}.
     */
    static long getIntervalMinutes() {
        String val = System.getProperty("REBALANCE_INTERVAL_MINUTES",
                System.getenv().getOrDefault("REBALANCE_INTERVAL_MINUTES", "15"));
        try {
            return Long.parseLong(val);
        } catch (NumberFormatException e) {
            return 15L;
        }
    }

    /** Collect balances and invoke {@link Rebalancer#rebalance(Map, double)}. */
    public void runOnce() {
        try {
            Map<String, Double> balances = new HashMap<>();
            double total = 0.0;
            for (Map.Entry<String, ExchangeAdapter> entry : adapters.entrySet()) {
                double bal = entry.getValue().getBalance("USDT");
                balances.put(entry.getKey(), bal);
                total += bal;
            }
            if (balances.isEmpty()) {
                logger.warn("No exchange adapters configured for rebalance");
                return;
            }
            double target = total / balances.size();
            rebalancer.rebalance(balances, target);
        } catch (Exception e) {
            logger.error("Rebalance job failed", e);
        }
    }

    /** Stop the scheduled task. */
    public void stop() {
        scheduler.shutdownNow();
    }
}
