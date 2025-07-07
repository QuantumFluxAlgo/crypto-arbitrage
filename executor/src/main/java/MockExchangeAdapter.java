package executor;

import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MockExchangeAdapter implements ExchangeAdapter {
    private static final Logger logger = LoggerFactory.getLogger(MockExchangeAdapter.class);
    private final Random random = new Random();
    private final String name;

    public MockExchangeAdapter() {
        this("Mock");
    }

    public MockExchangeAdapter(String name) {
        this.name = name;
    }

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

    @Override
    public double getFeeRate(String pair) {
        return 0.001;
    }

    @Override
    public double getBalance(String asset) {
        return 10_000.0;
    }

    @Override
    public void transfer(String asset, double amount, String destination) {
        logger.info("{} transferring {} {} to {}", name, amount, asset, destination);
    }
    
    @Override
    public boolean placeIocOrder(String pair, String side, double size, double price) {
        return placeOrder(pair, side, size, price);
    }
}

