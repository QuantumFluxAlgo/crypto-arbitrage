import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TradeLogger {
    private static final Logger logger = LoggerFactory.getLogger(TradeLogger.class);

    private final Connection connection;

    public TradeLogger(Connection connection) {
        this.connection = connection;
    }

    public void logTrade(SpreadOpportunity opp, double pnl) {
        String sql = "INSERT INTO trades (buy_exchange, sell_exchange, pair, net_edge, pnl, timestamp) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, opp.getBuyExchange());
            stmt.setString(2, opp.getSellExchange());
            stmt.setString(3, opp.getPair());
            stmt.setDouble(4, opp.getNetEdge());
            stmt.setDouble(5, pnl);
            stmt.setTimestamp(6, new Timestamp(System.currentTimeMillis()));
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                logger.info("Trade logged successfully");
            } else {
                logger.warn("Trade log insert affected 0 rows");
            }
        } catch (SQLException e) {
            logger.error("Failed to log trade", e);
        }
    }
}
