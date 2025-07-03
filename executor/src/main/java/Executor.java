package executor;

import domain.SpreadOpportunity;
import domain.TradeResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import safety.PanicBrake;
/**
 * Executor agent responsible for executing arbitrage opportunities.
 * Implements {@link ResumeHandler.ResumeCapable} to handle resume signals.
 */

public class Executor implements ResumeHandler.ResumeCapable, java.util.concurrent.Executor {
    private static final Logger logger = LoggerFactory.getLogger(Executor.class);

    private final RedisClient redisClient;
    private final RiskFilter riskFilter;
    private final NearMissLogger nearMissLogger;
    private final ResumeHandler resumeHandler;

    private double dailyLossPct;
    private double avgLatencyMs;
    private double winRate;
    private int totalTrades;
    private int winTrades;
    private long cumulativeLatencyMs;
    private boolean isPanic;

    public Executor(RedisClient redisClient, RiskFilter riskFilter, NearMissLogger nearMissLogger) {
        this.redisClient = redisClient;
        this.resumeHandler = new ResumeHandler(new redis.clients.jedis.Jedis("localhost", 6379), this);
        this.riskFilter = riskFilter;
        this.nearMissLogger = nearMissLogger;
    }

    public void start() {
        logger.info("Starting Redis client thread");
        redisClient.start();
        logger.info("Starting ResumeHandler thread");
        resumeHandler.start();
    }

    @Override
    public void execute(Runnable command) {
        if (command != null) {
            command.run();
        }
    }

    public void handleMessage(String message) {
        if (isPanic) {
            logger.warn("Trading halted due to panic brake.");
            return;
        }

        logger.debug("Received message: {}", message);
        SpreadOpportunity opp = SpreadOpportunity.fromJson(message);
        logger.debug("Parsed opportunity: {}", opp);

        if (!riskFilter.passes(opp)) {
            logger.info("Opportunity rejected by risk filter");
            nearMissLogger.log(opp, "rejected_by_risk_filter");
            return;
        }

        logger.info("Executing opportunity: {}", opp.getPair());

        TradeResult result = opp.execute(1.0, 1.0); // TODO: Replace with dynamic size/price logic

        updatePerformanceMetrics(result);

        if (result.success) {
            TradeLogger.log(opp, result.pnl);
            ProfitTracker.record(result.pnl);
            dailyLossPct = ProfitTracker.getDailyLossPct();
        } else {
            logger.error("Failed to execute trade");
        }

        if (PanicBrake.shouldHalt(dailyLossPct, avgLatencyMs, winRate)) {
            isPanic = true;
            logger.error("PANIC BRAKE TRIGGERED");
            AlertManager.sendAlert("PANIC BRAKE TRIGGERED");
            redisClient.publish("alerts", "PANIC BRAKE TRIGGERED");
        }
    }

    private void updatePerformanceMetrics(TradeResult result) {
        totalTrades++;
        cumulativeLatencyMs += result.latencyMs;
        avgLatencyMs = cumulativeLatencyMs / (double) totalTrades;

        if (result.success) {
            winTrades++;
        }
        winRate = winTrades / (double) totalTrades;

        logger.debug("Metrics: latency={}ms, winRate={}, totalTrades={}", result.latencyMs, winRate, totalTrades);
    }

    public void resumeTrading() {
        isPanic = false;
        logger.info("Trading manually resumed.");
    }

    public void resumeFromPanic() {
        isPanic = false;
        logger.info("PANIC RESUME SIGNAL RECEIVED");
    }
}
