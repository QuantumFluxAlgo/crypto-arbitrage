package adapters;

import executor.ExchangeAdapter;
import java.util.Collections;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * TODO: Implement Kraken API integration.
 */
public class KrakenAdapter implements ExchangeAdapter {
    private static final Logger logger = LoggerFactory.getLogger(KrakenAdapter.class);

    /** Connect to Kraken exchange. */
    public void connect() {
        logger.warn("Stub adapter: not yet implemented");
    }

    /** Return a dummy order book. */
    public Map<String, Double> getOrderBook(String pair) {
        logger.warn("Stub adapter: not yet implemented");
        return Collections.emptyMap();
    }

    @Override
    public boolean placeOrder(String pair, String side, double size, double limitPrice) {
        logger.warn("Stub adapter: not yet implemented");
        return false;
    }

    @Override
    public double getFeeRate(String pair) {
        return 0.0;
    }

    @Override
    public double getBalance(String asset) {
        return 0.0;
    }

    @Override
    public void transfer(String asset, double amount, String destination) {
        logger.warn("Stub adapter: not yet implemented");
    }

    @Override
    public void cancel(String orderId) {
        logger.warn("Stub adapter: not yet implemented");
    }
}
