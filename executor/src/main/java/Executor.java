package executor;

import domain.SpreadOpportunity;
import domain.TradeResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import safety.PanicBrake;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
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
    private final String redisHost;
    private final int redisPort;
    private Connection dbConnection;
    private TradeLogger tradeLogger;

    private double dailyLossPct;
    private double avgLatencyMs;
    private double winRate;
    private int totalTrades;
    private int winTrades;
    private long cumulativeLatencyMs;
    private boolean isPanic;

    public Executor(RedisClient redisClient, String redisHost, int redisPort, RiskFilter riskFilter, NearMissLogger nearMissLogger) {
        this.redisClient = redisClient;
        this.redisHost = redisHost;
        this.redisPort = redisPort;
        this.resumeHandler = new ResumeHandler(new redis.clients.jedis.Jedis(redisHost, redisPort), this);
        this.riskFilter = riskFilter;
        this.nearMissLogger = nearMissLogger;
    }

    public void start() {
        try {
            String host = System.getenv().getOrDefault("PGHOST", "localhost");
            String port = System.getenv().getOrDefault("PGPORT", "5432");
            String database = System.getenv().getOrDefault("PGDATABASE", "arbdb");
            String user = System.getenv().getOrDefault("PGUSER", "postgres");
            String password = System.getenv().getOrDefault("PGPASSWORD", "");
            String url = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            dbConnection = DriverManager.getConnection(url, user, password);
            tradeLogger = new TradeLogger(dbConnection);
            logger.info("Database connection established");
        } catch (SQLException e) {
            logger.error("Failed to connect to database", e);
        }
        
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
            if (tradeLogger != null) {
                tradeLogger.logTrade(opp, result.pnl);
            }
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

    public void shutdown() {
        redisClient.shutdown();
        try {
            if (dbConnection != null && !dbConnection.isClosed()) {
                dbConnection.close();
            }
        } catch (SQLException e) {
            logger.error("Error closing database connection", e);
        }
    }
}
