import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MockExchangeAdapter implements ExchangeAdapter {
    private static final Logger logger = LoggerFactory.getLogger(MockExchangeAdapter.class);
    private final Random random = new Random();

    @Override
    public boolean placeOrder(String pair, double quantity, double price, boolean isBuy) {
        boolean success = random.nextDouble() < 0.9;
        if (success) {
            logger.info("Filled {} order for {} {} at {}", isBuy ? "buy" : "sell", quantity, pair, price);
        } else {
            logger.warn("Order failed for {} {} at {}", quantity, pair, price);
        }
        return success;
    }

    @Override
    public double getFeeRate() {
        return 0.001;
    }

    @Override
    public double getBalance(String asset) {
        return 10000.0;
    }
}
