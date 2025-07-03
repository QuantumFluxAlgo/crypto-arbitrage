import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * Simple balance scanner that logs exchanges which are off their target by more than 30%.
 * Actual transfers will be implemented later.
 */
public class Rebalancer {
    private static final Logger logger = LoggerFactory.getLogger(Rebalancer.class);

    /**
     * Scan balances and log which exchanges deviate from the target.
     *
     * @param balances           map of exchange name to balance
     * @param targetPerExchange  desired balance on each exchange
     */
    public void scan(Map<String, Double> balances, double targetPerExchange) {
        if (balances == null || balances.isEmpty()) {
            logger.warn("No balances provided to scan");
            return;
        }
        double upper = targetPerExchange * 1.3;
        double lower = targetPerExchange * 0.7;
        for (Map.Entry<String, Double> entry : balances.entrySet()) {
            String exchange = entry.getKey();
            double balance = entry.getValue();
            if (balance > upper) {
                logger.info("{} balance {} over 30% above target {}", exchange, balance, targetPerExchange);
            } else if (balance < lower) {
                logger.info("{} balance {} under 30% below target {}", exchange, balance, targetPerExchange);
            }
        }
        // TODO: initiate transfers once engine is implemented
    }
}
