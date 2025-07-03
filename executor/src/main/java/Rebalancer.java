import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * Rebalancer that logs exchange balances outside a configurable threshold.
 * No transfers are performed—this is just for diagnostics.
 */
public class Rebalancer {
    private static final Logger logger = LoggerFactory.getLogger(Rebalancer.class);
    private final double threshold;

    /**
     * @param threshold allowed deviation from target before logging (e.g. 0.3 * target for ±30%)
     */
    public Rebalancer(double threshold) {
        this.threshold = threshold;
    }

    /**
     * Scan balances and log which exchanges deviate from the target.
     *
     * @param balances map of exchange name to current balance
     * @param target   target balance per exchange
     */
    public void scan(Map<String, Double> balances, double target) {
        if (balances == null || balances.isEmpty()) {
            logger.warn("No balances provided to scan");
            return;
        }

        for (Map.Entry<String, Double> entry : balances.entrySet()) {
            String exchange = entry.getKey();
            double balance = entry.getValue();

            if (balance > target + threshold) {
                logger.info("{} over target by {} ({} vs target {})",
                        exchange, balance - target, balance, target);
            } else if (balance < target - threshold) {
                logger.info("{} under target by {} ({} vs target {})",
                        exchange, target - balance, balance, target);
            } else {
                logger.info("{} within acceptable threshold ({} vs target {})",
                        exchange, balance, target);
            }
        }

        // TODO: initiate actual transfers once the execution engine is wired
    }
    
    /**
     * Wrapper around {@link #scan(Map, double)} for backward compatibility.
     * Currently it simply delegates to {@code scan}.
     *
     * @param balances map of exchange name to current balance
     * @param target   target balance per exchange
     */
    public void rebalance(Map<String, Double> balances, double target) {
        scan(balances, target);
    }
}
