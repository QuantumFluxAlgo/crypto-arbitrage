package executor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Persists cold wallet sweep events for auditing.
 */
public class SweepLogger {
    private static final Logger logger = LoggerFactory.getLogger(SweepLogger.class);
    private final Connection connection;

    public SweepLogger(Connection connection) {
        this.connection = connection;
    }

    /**
     * Record a sweep event in the database.
     *
     * @param amount  amount swept in USD
     * @param dest    destination address
     * @param trigger reason sweep was triggered
     */
    public void logSweep(double amount, String dest, String trigger) {
        if (connection == null) {
            logger.warn("No DB connection; skipping sweep log");
            return;
        }
        String sql = "INSERT INTO sweep_log (timestamp, amount, destination, trigger) VALUES (?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setTimestamp(1, new Timestamp(System.currentTimeMillis()));
            stmt.setDouble(2, amount);
            stmt.setString(3, dest);
            stmt.setString(4, trigger);
            stmt.executeUpdate();
        } catch (SQLException e) {
            logger.error("Failed to record sweep", e);
        }
    }
}
