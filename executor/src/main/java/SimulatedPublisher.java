package executor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Publishes simulated trade outcomes to Redis when ghost trading mode is enabled.
 */
public class SimulatedPublisher {
    private static final Logger logger = LoggerFactory.getLogger(SimulatedPublisher.class);
    /** Redis channel used for publishing simulated trades. */
    private static final String CHANNEL =
            System.getenv().getOrDefault("GHOST_FEED_CHANNEL", "ghost_feed");

    private final RedisClient redisClient;
    private final ObjectMapper mapper = new ObjectMapper();
    private boolean ghostMode;

    /**
     * Create a publisher using the {@code GHOST_MODE} environment variable.
     *
     * @param redisClient redis client instance used for publishing
     */
    public SimulatedPublisher(RedisClient redisClient) {
        this(redisClient, Boolean.parseBoolean(System.getenv().getOrDefault("GHOST_MODE", "false")));
    }

    /**
     * Create a publisher with an explicit ghost mode flag.
     *
     * @param redisClient redis client instance
     * @param ghostMode whether publishing is enabled
     */
    public SimulatedPublisher(RedisClient redisClient, boolean ghostMode) {
        this.redisClient = redisClient;
        this.ghostMode = ghostMode;
    }

    /**
     * Enable or disable ghost mode publishing.
     */
    public void setGhostMode(boolean ghostMode) {
        this.ghostMode = ghostMode;
    }

    /**
     * Publish a simulated trade result to Redis if ghost mode is enabled.
     *
     * @param pair trading pair
     * @param netEdge net edge observed
     * @param predictedProb predicted probability of success
     * @param latencyMs round trip latency in milliseconds
     * @param simulatedPnl simulated profit or loss
     */
    public void publish(String pair,
                        double netEdge,
                        double predictedProb,
                        long latencyMs,
                        double simulatedPnl) {
        if (!ghostMode) {
            return;
        }
        try {
            ObjectNode node = mapper.createObjectNode();
            node.put("pair", pair);
            node.put("net_edge", netEdge);
            node.put("predicted_prob", predictedProb);
            node.put("latency_ms", latencyMs);
            node.put("simulated_pnl", simulatedPnl);
            redisClient.publish(CHANNEL, mapper.writeValueAsString(node));
        } catch (Exception e) {
            logger.error("Failed to publish simulated trade", e);
        }
    }
}

