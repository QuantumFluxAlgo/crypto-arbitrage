
package executor;

import executor.SpreadOpportunity;
import executor.TradeResult;
import executor.SandboxExchangeAdapter;
import executor.PanicBrake;
import executor.FeatureLogger;
import executor.ConfigValidator;
import executor.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
    private final ScoringEngine scoringEngine;
    private final ProfitEstimator profitEstimator;
    private final SimulatedPublisher simulatedPublisher;
    private final RiskSettings riskSettings;
    private final ResumeHandler resumeHandler;
    private final String redisHost;
    private final int redisPort;
    private Connection dbConnection;
    private TradeLogger tradeLogger;
    private FeatureLogger featureLogger;

    private double dailyLossPct;
    private double avgLatencyMs;
    private double winRate;
    private int totalTrades;
    private int winTrades;
    private long cumulativeLatencyMs;
    private boolean isPanic;
    private boolean canaryMode;
    private boolean ghostMode;
    private boolean sandboxMode;
    private CircuitBreaker circuitBreaker;

    public Executor(RedisClient redisClient, String redisHost, int redisPort, RiskFilter riskFilter, NearMissLogger nearMissLogger) {
        this.redisClient = redisClient;
        this.redisHost = redisHost;
        this.redisPort = redisPort;
        this.resumeHandler = new ResumeHandler(new redis.clients.jedis.Jedis(redisHost, redisPort), this);
        this.riskFilter = riskFilter;
        this.nearMissLogger = nearMissLogger;
        this.scoringEngine = new ScoringEngine();
        this.profitEstimator = new ProfitEstimator();
        this.simulatedPublisher = new SimulatedPublisher(redisClient, true);
        this.riskSettings = new RiskSettings();
        double cbWinRate = Double.parseDouble(System.getenv().getOrDefault("CB_WIN_RATE_THRESHOLD", "0.35"));
        double cbDrawdown = Double.parseDouble(System.getenv().getOrDefault("CB_MAX_DRAWDOWN_PCT", "5.0"));
        this.circuitBreaker = new CircuitBreaker(redisClient, cbWinRate, cbDrawdown);
        this.canaryMode = Boolean.parseBoolean(System.getenv().getOrDefault("CANARY_MODE", "false"));
        this.ghostMode = Boolean.parseBoolean(System.getenv().getOrDefault("GHOST_MODE", "false"));
        this.sandboxMode = Boolean.parseBoolean(System.getenv().getOrDefault("SANDBOX_MODE", "false"));
    }

    public void start() {
        // ✅ Config validation for runtime safety
        try {
            ConfigValidator validator = new ConfigValidator(
                Double.parseDouble(System.getenv().getOrDefault("LOSS_CAP_PCT", "5.0")),
                Double.parseDouble(System.getenv().getOrDefault("LATENCY_MAX_MS", "250.0")),
                Double.parseDouble(System.getenv().getOrDefault("WIN_RATE_THRESHOLD", "0.5"))
            );
            validator.validate();
        } catch (RuntimeException ex) {
            logger.error("❌ CONFIG VALIDATION FAILED: {}", ex.getMessage());
            return;
        }

        int attempts = 0;
        boolean connected = false;
        int maxRetries = Integer.parseInt(System.getenv().getOrDefault("DB_RETRIES", "3"));
        long retryDelayMs = Long.parseLong(System.getenv().getOrDefault("DB_RETRY_DELAY_MS", "2000"));
        String host = System.getenv().getOrDefault("PGHOST", "localhost");
        String port = System.getenv().getOrDefault("PGPORT", "5432");
        String database = System.getenv().getOrDefault("PGDATABASE", "arbdb");
        String user = System.getenv().getOrDefault("PGUSER", "postgres");
        String password = System.getenv().getOrDefault("PGPASSWORD", "");
        String url = "jdbc:postgresql://" + host + ":" + port + "/" + database;

        while (attempts < maxRetries && !connected) {
            try {
                dbConnection = DriverManager.getConnection(url, user, password);
                tradeLogger = new TradeLogger(dbConnection);
                featureLogger = new FeatureLogger(dbConnection);
                logger.info("✅ Database connection established");
                connected = true;
            } catch (SQLException e) {
                attempts++;
                logger.error("❌ Failed to connect to database (attempt {}/{})", attempts, maxRetries, e);
                if (attempts >= maxRetries) {
                    logger.error("❌ Could not establish database connection after {} attempts. Executor will not start.", attempts);
                    return;
                }
                try {
                    Thread.sleep(retryDelayMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    logger.error("❌ Retry sleep interrupted", ie);
                    return;
                }
            }
        }

        logger.info("🚀 Starting Redis client thread");
        redisClient.start();
        logger.info("🔁 Starting ResumeHandler thread");
        resumeHandler.start();
    }

    @Override
    public void execute(Runnable command) {
        if (command != null) {
            command.run();
        }
    }

    public void handleMessage(String message) {
        if (circuitBreaker.isTripped()) {
            logger.warn("Trading halted due to circuit breaker.");
            return;
        }
        if (isPanic) {
            logger.warn("Trading halted due to panic brake.");
            return;
        }

        logger.debug("Received message: {}", message);
        SpreadOpportunity opp = SpreadOpportunity.fromJson(message);
        logger.debug("Parsed opportunity: {}", opp);

        double predictedProb = scoringEngine.predict(opp);
        double simulatedPnl = profitEstimator.estimate(opp);

        if (sandboxMode) {
            logger.info("SANDBOX MODE — publishing simulated trade");
            simulatedPublisher.publish(opp.getPair(), opp.getNetEdge(), predictedProb,
                    opp.getRoundTripLatencyMs(), simulatedPnl);
            return;
        }

        if (!riskFilter.passes(opp)) {
            logger.info("Opportunity rejected by risk filter");
            nearMissLogger.log(opp, "rejected_by_risk_filter");
            return;
        }

        if (!scoringEngine.scoreSpread(opp)) {
            logger.info("Opportunity rejected by scoring engine");
            nearMissLogger.log(opp, "rejected_by_scoring");
            return;
        }

        if (ghostMode) {
            logger.info("GHOST MODE — broadcasting opportunity");
            redisClient.publish("ghost-feed", message);
            return;
        }

        if (canaryMode) {
            logger.info("CANARY MODE — trade bypassed");
            return;
        }

        logger.info("Executing opportunity: {}", opp.getPair());

        double tradeSize = riskSettings.computeTradeSize();
        TradeResult result;
        if (sandboxMode) {
            SandboxExchangeAdapter adapter = new SandboxExchangeAdapter(
                    redisClient,
                    o -> scoringEngine.predictProbability(o));
            result = adapter.execute(opp, tradeSize, 1.0);
        } else {
            result = opp.execute(tradeSize, 1.0);
        }

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

        if (featureLogger != null) {
            double slippage = opp.getGrossEdge() - opp.getNetEdge();
            double volatility = 0.0; // TODO derive from market data
            double latencySec = result.latencyMs / 1000.0;
            int label = result.pnl > 0 ? 1 : 0;
            featureLogger.logFeatureVector(opp.getPair(), opp.getNetEdge(), slippage, volatility, latencySec, label);
        }

        
        double drawdown = 0.0;
        double globalTotal = ProfitTracker.getGlobalTotal();
        if (globalTotal < 0) {
            drawdown = (-globalTotal / ProfitTracker.getStartingBalance()) * 100.0;
        }
        circuitBreaker.check(winRate, drawdown);

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
        circuitBreaker.reset();
        logger.info("Trading manually resumed.");
    }

    public void resumeFromPanic() {
        isPanic = false;
        circuitBreaker.reset();
        logger.info("PANIC RESUME SIGNAL RECEIVED");
    }

    public void setCanaryMode(boolean mode) {
        this.canaryMode = mode;
    }

    public boolean isCanaryMode() {
        return canaryMode;
    }

    public void setGhostMode(boolean mode) {
        this.ghostMode = mode;
    }

    public boolean isGhostMode() {
        return ghostMode;
    }

    public void setSandboxMode(boolean mode) {
        this.sandboxMode = mode;
    }

    public boolean isSandboxMode() {
        return sandboxMode;
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
