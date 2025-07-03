import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Executor {
    private static final Logger logger = LoggerFactory.getLogger(Executor.class);

    private final RedisClient redisClient;
    private final RiskFilter riskFilter;
    private final NearMissLogger nearMissLogger;

    public Executor(RedisClient redisClient, RiskFilter riskFilter, NearMissLogger nearMissLogger) {
        this.redisClient = redisClient;
        this.riskFilter = riskFilter;
        this.nearMissLogger = nearMissLogger;
    }

    public void start() {
        logger.info("Subscribing to Redis channel 'opportunities'");
        redisClient.subscribe("opportunities", this::handleMessage);
    }

    private void handleMessage(String message) {
        logger.debug("Received message: {}", message);
        SpreadOpportunity opp = SpreadOpportunity.fromJson(message);
        logger.debug("Parsed opportunity: {}", opp);

        if (!riskFilter.passes(opp)) {
            logger.info("Opportunity rejected by risk filter");
            nearMissLogger.log(opp);
            return;
        }

        logger.info("EXECUTING...");
        // Execution logic will be implemented in Batch 5
    }
}
