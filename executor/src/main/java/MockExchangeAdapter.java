package executor;

import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Simple in-memory implementation of {@link ExchangeAdapter} used for tests
 * and simulations.
 */
public class MockExchangeAdapter implements ExchangeAdapter {
    private static final Logger logger = LoggerFactory.getLogger(MockExchangeAdapter.class);
    private final Random random = new Random();
    private final String name;

    /** Create an adapter with the default exchange name. */
    public MockExchangeAdapter() {
        this("Mock");
    }

    /**
     * @param name identifier used when logging activity
     */
    public MockExchangeAdapter(String name) {
        this.name = name;
    }

    /** {@inheritDoc} */
    @Override
    public boolean placeOrder(String pair, String side, double size, double price) {
        boolean success = random.nextDouble() < 0.9;
        if (success) {
            logger.info("{} filled {} order for {} {} @ {}", name, side, size, pair, price);
        } else {
            logger.warn("{} failed {} order for {} {} @ {}", name, side, size, pair, price);
        }
        return success;
    }

    /** {@inheritDoc} */
    @Override
    public double getFeeRate(String pair) {
        return 0.001;
    }

    /** {@inheritDoc} */
    @Override
    public double getBalance(String asset) {
        return 10_000.0;
    }

    /** {@inheritDoc} */
    @Override
    public void transfer(String asset, double amount, String destination) {
        logger.info("{} transferring {} {} to {}", name, amount, asset, destination);
    }
    
    /** {@inheritDoc} */
    @Override
    public boolean placeIocOrder(String pair, String side, double size, double price) {
        return placeOrder(pair, side, size, price);
    }
}
