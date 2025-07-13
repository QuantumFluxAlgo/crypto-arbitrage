package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Collections;
import java.util.HashMap;
import java.util.Objects;

import java.util.Map;

/**
 * Rebalancer that logs exchange balances outside a configurable threshold.
 * No transfers are performed—this is just for diagnostics.
 */
public class Rebalancer {
    private static final Logger logger = LoggerFactory.getLogger(Rebalancer.class);
    private final double threshold;
    private final Map<String, ExchangeAdapter> adapters;

    /**
     * @param threshold allowed deviation from target before logging (e.g. 0.3 * target for ±30%)
     */
    public Rebalancer(double threshold) {
        this(threshold, Collections.emptyMap());
    }

    /**
     * @param threshold allowed deviation from target before logging
     * @param adapters  exchange adapters used for optional transfers
     */
    public Rebalancer(double threshold, Map<String, ExchangeAdapter> adapters) {
        this.threshold = threshold;
        this.adapters = Objects.requireNonNullElse(adapters, Collections.emptyMap());
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

        Map<String, String> status = new HashMap<>();

        for (Map.Entry<String, Double> entry : balances.entrySet()) {
            String exchange = entry.getKey();
            double balance = entry.getValue();

            if (balance > target + threshold) {
                logger.info("{} over target by {} ({} vs target {})",
                        exchange, balance - target, balance, target);
                status.put(exchange, String.format("OVER by %.2f", balance - target));
                ExchangeAdapter adapter = adapters.get(exchange);
                if (adapter != null) {
                    adapter.transfer("USDT", balance - target, "treasury");
                }
            } else if (balance < target - threshold) {
                logger.info("{} under target by {} ({} vs target {})",
                        exchange, target - balance, balance, target);
                status.put(exchange, String.format("UNDER by %.2f", target - balance));
                ExchangeAdapter adapter = adapters.get(exchange);
                if (adapter != null) {
                    adapter.transfer("USDT", target - balance, exchange);
                }
            } else {
                logger.info("{} within acceptable threshold ({} vs target {})",
                        exchange, balance, target);
                status.put(exchange, "OK");
            }
        }

        logger.info("Balance scan summary: {}", status);
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

    /**
     * Simulate routing funds from overbalanced exchanges to those below the
     * target. The target is calculated as 30% of the total NAV across the
     * provided balances. Only logs are emitted; no real transfers occur.
     *
     * @param balances map of exchange name to current balance
     */
    public void performRebalance(Map<String, Double> balances) {
        if (balances == null || balances.isEmpty()) {
            logger.warn("No balances provided for performRebalance");
            return;
        }

        double total = 0.0;
        for (double bal : balances.values()) {
            total += bal;
        }

        double target = total * 0.30;

        Map<String, Double> surplus = new HashMap<>();
        Map<String, Double> deficit = new HashMap<>();

        for (Map.Entry<String, Double> entry : balances.entrySet()) {
            double balance = entry.getValue();
            double diff = balance - target;
            if (diff > threshold) {
                surplus.put(entry.getKey(), diff);
            } else if (-diff > threshold) {
                deficit.put(entry.getKey(), -diff);
            }
        }

        for (Map.Entry<String, Double> deficitEntry : new HashMap<>(deficit).entrySet()) {
            String under = deficitEntry.getKey();
            double needed = deficitEntry.getValue();
            for (Map.Entry<String, Double> surplusEntry : new HashMap<>(surplus).entrySet()) {
                if (needed <= 0) break;
                String over = surplusEntry.getKey();
                double available = surplusEntry.getValue();

                if (available <= 0) {
                    surplus.remove(over);
                    continue;
                }

                double amount = Math.min(available, needed);
                logger.info("[REBALANCER] Rebalancing ${} from {} \u2192 {} (imbalance threshold exceeded)",
                        String.format("%.2f", amount), over, under);

                available -= amount;
                needed -= amount;

                if (available <= 0) {
                    surplus.remove(over);
                } else {
                    surplus.put(over, available);
                }
            }
            if (needed > 0) {
                logger.warn("[REBALANCER] Unable to fully cover deficit for {} (short ${})",
                        under, String.format("%.2f", needed));
            }
        }
    }
}
