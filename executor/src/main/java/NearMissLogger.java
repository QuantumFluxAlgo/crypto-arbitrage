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
        String sql = "INSERT INTO near_misses (buy_exchange, sell_exchange, pair, gross_edge, net_edge, reason, expected_profit_usd, latency_ms) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, opp.getBuyExchange());
            stmt.setString(2, opp.getSellExchange());
            stmt.setString(3, opp.getPair());
            stmt.setBigDecimal(4, opp.getGrossEdge());
            stmt.setBigDecimal(5, opp.getNetEdge());
            stmt.setString(6, reason);
            stmt.setBigDecimal(7, opp.getExpectedProfitUsd());
            stmt.setLong(8, opp.getLatencyMs());
            stmt.executeUpdate();
        } catch (SQLException e) {
            logger.error("Failed to log near miss", e);
        }
    }
}

