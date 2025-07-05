package executor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class NearMissLogger {
    private static final Logger logger = LoggerFactory.getLogger(NearMissLogger.class);

    private final Connection connection;

    public NearMissLogger(Connection connection) {
        this.connection = connection;
    }

    public void log(SpreadOpportunity opp, String reason) {
        String sql = "INSERT INTO near_misses (buy_exchange, sell_exchange, pair, gross_edge, net_edge, reason, latency_ms, round_trip_latency_ms) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, opp.getBuyExchange());
            stmt.setString(2, opp.getSellExchange());
            stmt.setString(3, opp.getPair());
            stmt.setDouble(4, opp.getGrossEdge());
            stmt.setDouble(5, opp.getNetEdge());
            stmt.setString(6, reason);
            stmt.setLong(7, opp.getLatencyMs());
            stmt.setLong(8, opp.getRoundTripLatencyMs());
            stmt.executeUpdate();
        } catch (SQLException e) {
            logger.error("Failed to log near miss", e);
        }
    }
}

