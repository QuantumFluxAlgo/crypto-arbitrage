package executor;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

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
        String redisHost = System.getenv().getOrDefault("REDIS_HOST", "localhost");
        int redisPort = Integer.parseInt(System.getenv().getOrDefault("REDIS_PORT", "6379"));
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
        NearMissLogger nearMissLogger = new NearMissLogger(conn);
        TradeLogger tradeLogger = new TradeLogger(conn);

        final Executor[] holder = new Executor[1];
        RedisClient redisClient = new RedisClient(redisHost, redisPort, redisChannel,
                (ch, msg) -> holder[0].handleMessage(msg));

        holder[0] = new Executor(redisClient, redisHost, redisPort, riskFilter, nearMissLogger);
        holder[0].start();
    }
}
