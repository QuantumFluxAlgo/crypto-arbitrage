package executor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Random;

/**
 * Exchange adapter used for sandbox mode to simulate trades with slippage,
 * fees and artificial latency. Results are logged to the ledger and
 * published to the {@code ghost_feed} Redis channel so the dashboard can
 * display simulated performance.
 */
public class SandboxExchangeAdapter extends MockExchangeAdapter {
    private static final Logger logger = LoggerFactory.getLogger(SandboxExchangeAdapter.class);
    /** Redis channel used for publishing sandbox trade results. */
    private static final String CHANNEL =
            System.getenv().getOrDefault("GHOST_FEED_CHANNEL", "ghost_feed");

    private final Random random;
    private final double slippagePct;
    private final long latencyMs;
    private final RedisClient redisClient;
    private final ModelPredictor predictor;

    private static double parseDoubleEnv(String key, double def) {
        String val = System.getProperty(key,
                System.getenv().getOrDefault(key, Double.toString(def)));
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return def;
        }
    }

    private static long parseLongEnv(String key, long def) {
        String val = System.getProperty(key,
                System.getenv().getOrDefault(key, Long.toString(def)));
        try {
            return Long.parseLong(val);
        } catch (NumberFormatException e) {
            return def;
        }
    }

    /**
     * Construct using environment configured parameters.
     */
    public SandboxExchangeAdapter(RedisClient redisClient,
                                  ModelPredictor predictor) {
        this(redisClient, predictor, new Random());
    }

    /**
     * Construct using environment configured parameters and explicit RNG.
     */
    public SandboxExchangeAdapter(RedisClient redisClient,
                                  ModelPredictor predictor,
                                  Random random) {
        this("Sandbox", redisClient, predictor,
             parseDoubleEnv("SANDBOX_SLIPPAGE", 0.0005),
             parseDoubleEnv("SANDBOX_FEE", 0.001),
             parseLongEnv("SANDBOX_LATENCY_MS", 50),
             random);
    }

    /**
     * Create a sandbox adapter with explicit settings.
     */
    public SandboxExchangeAdapter(String name,
                                  RedisClient redisClient,
                                  ModelPredictor predictor,
                                  double slippagePct,
                                  double feeRate,
                                  long latencyMs) {
        this(name, redisClient, predictor, slippagePct, feeRate, latencyMs, new Random());
    }

    /**
     * Create a sandbox adapter with explicit settings and random source.
     */
    public SandboxExchangeAdapter(String name,
                                  RedisClient redisClient,
                                  ModelPredictor predictor,
                                  double slippagePct,
                                  double feeRate,
                                  long latencyMs,
                                  Random random) {
        super(name, 0.0002, random);
        this.random = random;
        this.redisClient = redisClient;
        this.predictor = predictor;
        this.slippagePct = slippagePct;
        // Store fee rate in the shared map so it can be retrieved dynamically
        MockExchangeAdapter.setFeeRate(name, feeRate);
        this.latencyMs = latencyMs;
    }

    @Override
    public boolean placeOrder(String pair, String side, double size, double price) {
        try {
            Thread.sleep(latencyMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        double slippage = price * slippagePct * (random.nextBoolean() ? 1 : -1);
        double execPrice = price + slippage;
        return super.placeOrder(pair, side, size, execPrice);
    }

    @Override
    public boolean placeIocOrder(String pair, String side, double size, double price) {
        return placeOrder(pair, side, size, price);
    }

    /**
     * Execute a simulated trade and publish the result.
     *
     * @param opp   spread opportunity to trade
     * @param size  trade size
     * @param price trade price
     * @return trade result
     */
    public TradeResult execute(SpreadOpportunity opp, double size, double price) {
        double predicted = predictor.predict(opp);
        long start = System.currentTimeMillis();

        double buyCancel = 0.0;
        double sellCancel = 0.0;
        boolean buyOk = false;
        boolean sellOk = false;
        double buyPrice = price;
        double sellPrice = price;
        int attempts = 0;
        final int maxRetries = 3;

        while (attempts < maxRetries && !buyOk) {
            buyOk = placeOrder(opp.getPair(), "BUY", size, price);
            buyCancel += getLastCancelFee();
            buyPrice = getLastExecPrice();
            attempts++;
        }

        if (buyOk) {
            attempts = 0;
            while (attempts < maxRetries && !sellOk) {
                sellOk = placeOrder(opp.getPair(), "SELL", size, price);
                sellCancel += getLastCancelFee();
                sellPrice = getLastExecPrice();
                attempts++;
            }
        }

        long end = System.currentTimeMillis();
        long latency = end - start;

        double buyFee = size * buyPrice * getFeeRate(opp.getPair());
        double sellFee = size * sellPrice * getFeeRate(opp.getPair());

        double slippageLoss = (buyPrice - price) * size + (price - sellPrice) * size;
        double pnl = opp.getNetEdge() - buyFee - sellFee - buyCancel - sellCancel - slippageLoss;

        boolean success = buyOk && sellOk;
        if (!success) {
            pnl = 0.0;
        }

        if (redisClient != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                ObjectNode node = mapper.createObjectNode();
                node.put("pair", opp.getPair());
                node.put("net_edge", opp.getNetEdge());
                node.put("predicted_prob", predicted);
                node.put("latency_ms", latency);
                node.put("simulated_pnl", pnl);
                redisClient.publish(CHANNEL, mapper.writeValueAsString(node));
            } catch (Exception e) {
                logger.error("Failed to publish sandbox trade", e);
            }
        }

        return new TradeResult(success, pnl, latency);
    }
}
