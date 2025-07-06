package executor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Persists feature vectors for training purposes.
 */
public class FeatureLogger {
    private static final Logger logger = LoggerFactory.getLogger(FeatureLogger.class);
    private final Connection connection;

    public FeatureLogger(Connection connection) {
        this.connection = connection;
    }

    /**
     * Persist a training feature vector.
     *
     * @param pair the trading pair
     * @param netEdge the net edge observed
     * @param slippage slippage experienced
     * @param volatility market volatility
     * @param latency latency in seconds
     * @param label binary label indicating profitable (1) or not (0)
     */
    public void logFeatureVector(String pair,
                                 double netEdge,
                                 double slippage,
                                 double volatility,
                                 double latency,
                                 int label) {
        String sql = "INSERT INTO training_features " +
                     "(pair, net_edge, slippage, volatility, latency, label, timestamp) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, pair);
            stmt.setDouble(2, netEdge);
            stmt.setDouble(3, slippage);
            stmt.setDouble(4, volatility);
            stmt.setDouble(5, latency);
            stmt.setInt(6, label);
            stmt.setTimestamp(7, new Timestamp(System.currentTimeMillis()));
            stmt.executeUpdate();
        } catch (SQLException e) {
            logger.error("Failed to log feature vector", e);
        }
    }
}

