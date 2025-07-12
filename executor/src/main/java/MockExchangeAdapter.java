package executor;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Simple in-memory implementation of {@link ExchangeAdapter} used for tests
 * and simulations.
 */
public class MockExchangeAdapter implements ExchangeAdapter {
    private static final Logger logger = LoggerFactory.getLogger(MockExchangeAdapter.class);
    /** Fee rates keyed by exchange name. */
    private static final Map<String, Double> FEE_RATES = new ConcurrentHashMap<>();

    static {
        FEE_RATES.put("Mock", 0.001);
    }

    private final Random random = new Random();
    private final String name;
    private final double cancelFeeRate;
    private double lastFillSize = 0.0;
    private double lastCancelFee = 0.0;

    /** Create an adapter with the default exchange name. */
    public MockExchangeAdapter() {
        this("Mock");
    }

    /**
     * @param name identifier used when logging activity
     */
    public MockExchangeAdapter(String name) {
        this(name, 0.0002);
    }

    /**
     * @param name           identifier used when logging activity
     * @param cancelFeeRate  fee charged when an order is cancelled or partially filled
     */
    public MockExchangeAdapter(String name, double cancelFeeRate) {
        this.name = name;
        this.cancelFeeRate = cancelFeeRate;
    }

    /**
     * Set the trading fee rate for a specific exchange name.
     *
     * @param exchange exchange identifier
     * @param rate     fee rate (e.g. 0.001 for 0.1%)
     */
    public static void setFeeRate(String exchange, double rate) {
        FEE_RATES.put(exchange, rate);
    }

    /**
     * @return adapter name used for fee lookup
     */
    public String getName() {
        return name;
    }

    /** {@inheritDoc} */
    @Override
    public boolean placeOrder(String pair, String side, double size, double price) {
        lastFillSize = 0.0;
        lastCancelFee = 0.0;
        double r = random.nextDouble();
        if (r < 0.8) {
            lastFillSize = size;
            logger.info("{} filled {} order for {} {} @ {}", name, side, size, pair, price);
            return true;
        }
        if (r < 0.9) {
            lastFillSize = size * (0.5 + random.nextDouble() * 0.4);
            lastCancelFee = (size - lastFillSize) * price * cancelFeeRate;
            logger.warn("{} partially filled {} order: {} of {} @ {} (cancel fee {})", name, side,
                    lastFillSize, size, pair, lastCancelFee);
        } else {
            lastCancelFee = size * price * cancelFeeRate;
            logger.warn("{} failed {} order for {} {} @ {} (cancel fee {})", name, side, size, pair, price, lastCancelFee);
        }
        return false;
    }

    /**
     * Fee rate for this adapter pulled from the shared map. If no specific
     * entry exists for the adapter name, the default "Mock" rate is used.
     */
    @Override
    public double getFeeRate(String pair) {
        return FEE_RATES.getOrDefault(name, FEE_RATES.getOrDefault("Mock", 0.001));
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

    /**
     * @return size actually filled on the last order
     */
    public double getLastFillSize() {
        return lastFillSize;
    }

    /**
     * @return cancellation fee charged for the last order
     */
    public double getLastCancelFee() {
        return lastCancelFee;
    }

    /**
     * @return cancellation fee rate used by this adapter
     */
    public double getCancelFeeRate() {
        return cancelFeeRate;
    }
}
