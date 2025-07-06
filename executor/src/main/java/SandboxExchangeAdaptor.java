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
    private static final String CHANNEL = "ghost_feed";

    private final Random random = new Random();
    private final double slippagePct;
    private final double feeRate;
    private final long latencyMs;
    private final RedisClient redisClient;
    private final ModelPredictor predictor;

    public SandboxExchangeAdapter(RedisClient redisClient,
                                  ModelPredictor predictor) {
        this("Sandbox", redisClient, predictor,
             Double.parseDouble(System.getenv().getOrDefault("SANDBOX_SLIPPAGE", "0.0005")),
             Double.parseDouble(System.getenv().getOrDefault("SANDBOX_FEE", "0.001")),
             Long.parseLong(System.getenv().getOrDefault("SANDBOX_LATENCY_MS", "50")));
    }

    public SandboxExchangeAdapter(String name,
                                  RedisClient redisClient,
                                  ModelPredictor predictor,
                                  double slippagePct,
                                  double feeRate,
                                  long latencyMs) {
        super(name);
        this.redisClient = redisClient;
        this.predictor = predictor;
        this.slippagePct = slippagePct;
        this.feeRate = feeRate;
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
    public double getFeeRate(String pair) {
        return feeRate;
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
        boolean buyOk = placeOrder(opp.getPair(), "BUY", size, price);
        boolean sellOk = placeOrder(opp.getPair(), "SELL", size, price);
        long end = System.currentTimeMillis();
        long latency = end - start;

        double pnl = opp.getNetEdge() - size * price * getFeeRate(opp.getPair());

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

        return new TradeResult(buyOk && sellOk, pnl, latency);
    }
}

