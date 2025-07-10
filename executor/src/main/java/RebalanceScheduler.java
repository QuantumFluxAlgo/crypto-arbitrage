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

    public RebalanceScheduler(Rebalancer rebalancer, Map<String, ExchangeAdapter> adapters) {
        this.rebalancer = rebalancer;
        this.adapters = adapters;
    }

    /** Start the 15 minute rebalance job. */
    public void start() {
        scheduler.scheduleAtFixedRate(this::runOnce, 0, 15, TimeUnit.MINUTES);
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
