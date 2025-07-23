package executor;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import executor.ColdSweeper;
import executor.ColdSweepScheduler;
import executor.RebalanceScheduler;
import executor.Rebalancer;
import executor.ExchangeAdapter;
import executor.ProfitTracker;
import executor.SweepHandler;
import executor.SweepLogger;
import executor.TriangularArbDetector;
import executor.DailyResetScheduler;
import executor.MockWalletClient;
import executor.ColdSweeperConfig;
import redis.clients.jedis.Jedis;

/**
 * Entry point for launching the executor from the command line.
 */
public class Main {

    /**
     * Configure dependencies and start the {@link Executor}.
     *
     * @param args unused
     */
    public static void main(String[] args) {
        String redisUrl = System.getenv().getOrDefault("REDIS_URL", "redis://localhost:6379");
        String redisHost = "localhost";
        int redisPort = 6379;
        try {
            java.net.URI uri = new java.net.URI(redisUrl);
            if (uri.getHost() != null) {
                redisHost = uri.getHost();
            }
            if (uri.getPort() != -1) {
                redisPort = uri.getPort();
            }
            System.out.println("[REDIS] Connected to " + redisHost + ":" + redisPort + " via REDIS_URL");
        } catch (Exception e) {
            System.err.println("[REDIS] Invalid REDIS_URL: " + e.getMessage());
        }
        String redisChannel = System.getenv().getOrDefault("REDIS_CHANNEL", "spreads");
        
        double startingBalance = Double.parseDouble(System.getenv().getOrDefault("STARTING_BALANCE", "10000"));
        String analyticsUrl = System.getenv().getOrDefault("ANALYTICS_URL", "http://localhost:5000/trade");

        ProfitTracker.init(startingBalance, analyticsUrl);

        Connection conn = null;
        try {
            String host = System.getenv().getOrDefault("PGHOST", "localhost");
            String port = System.getenv().getOrDefault("PGPORT", "5432");
            String database = System.getenv().getOrDefault("PGDATABASE", "arbdb");
            String user = System.getenv().getOrDefault("PGUSER", "postgres");
            String password = System.getenv().getOrDefault("PGPASSWORD", "");
            String url = "jdbc:postgresql://" + host + ":" + port + "/" + database;
            conn = DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            e.printStackTrace();
        }

        String mode = System.getenv().getOrDefault("PERSONALITY_MODE", "REALISTIC");
        RiskFilter riskFilter = new RiskFilter(mode);
        String execMode = System.getenv().getOrDefault("EXECUTION_MODE", "live");
        ExecutionMode executionMode = execMode.equalsIgnoreCase("sandbox") || execMode.equalsIgnoreCase("dry-run")
                ? ExecutionMode.SANDBOX : ExecutionMode.LIVE;
        Config configObj = new Config(executionMode);
        NearMissLogger nearMissLogger = new NearMissLogger(conn);
        TradeLogger tradeLogger = new TradeLogger(conn);
        SweepLogger sweepLogger = new SweepLogger(conn);

        final Executor[] holder = new Executor[1];
        RedisClient redisClient = new RedisClient(redisHost, redisPort, redisChannel,
                (ch, msg) -> holder[0].handleMessage(msg));

        holder[0] = new Executor(redisClient, redisHost, redisPort, riskFilter, nearMissLogger, configObj);
        holder[0].start();

        TriangularArbDetector arbDetector = new TriangularArbDetector(holder[0]);
        String bookChannel = System.getenv().getOrDefault("ORDERBOOK_CHANNEL", "orderbook");
        RedisClient bookClient = new RedisClient(redisHost, redisPort, bookChannel, (ch, msg) -> {
            try {
                com.fasterxml.jackson.databind.JsonNode node = new com.fasterxml.jackson.databind.ObjectMapper().readTree(msg);
                if (node.has("pair") && node.has("bid") && node.has("ask")) {
                    arbDetector.update(node.get("pair").asText(), node.get("bid").asDouble(), node.get("ask").asDouble());
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        bookClient.start();

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            arbDetector.stop();
            bookClient.shutdown();
        }));

        // Initialize background schedulers
        ColdSweeper sweeper = new ColdSweeper(5000.0, 0.30, new MockWalletClient(), new ColdSweeperConfig(), sweepLogger);
        ColdSweepScheduler sweepScheduler = new ColdSweepScheduler(
                sweeper,
                () -> System.getProperty("sweep_cadence",
                        System.getenv().getOrDefault("sweep_cadence", "None")),
                ProfitTracker::getCumulativeProfit,
                () -> ProfitTracker.getStartingBalance() + ProfitTracker.getCumulativeProfit()
        );
        sweepScheduler.start();

        DailyResetScheduler resetScheduler = new DailyResetScheduler();
        resetScheduler.start();

        // start handler for manual sweeps
        SweepHandler sweepHandler = new SweepHandler(new Jedis(redisHost, redisPort), sweeper);
        sweepHandler.start();

        Rebalancer rebalancer = new Rebalancer(250.0);
        Map<String, ExchangeAdapter> adapters = new HashMap<>();
        RebalanceScheduler rebalanceScheduler = new RebalanceScheduler(rebalancer, adapters);
        rebalanceScheduler.start();
    }
}
