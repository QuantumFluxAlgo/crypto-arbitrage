package executor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Writes executed trades to the database for auditing purposes.
 */
public class TradeLogger {
    private static final Logger logger = LoggerFactory.getLogger(TradeLogger.class);
    private final Connection connection;

    public static final String STATUS_SUCCESS = "success";
    public static final String STATUS_FAILED = "failed";
    public static final String STATUS_REJECTED = "rejected";
    public static final String STATUS_SKIPPED = "skipped";

    /**
     * @param connection database connection used for inserts
     */
    public TradeLogger(Connection connection) {
        this.connection = connection;
    }

    /**
     * Log the trade to both the database and the application log.
     *
     * @param opp the spread opportunity that was executed
     * @param pnl the profit or loss from the trade
     */
    public void logTrade(SpreadOpportunity opp, double pnl) {
        String sql = "INSERT INTO trades (buy_exchange, sell_exchange, pair, net_edge, pnl, timestamp) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, opp.getBuyExchange());
            stmt.setString(2, opp.getSellExchange());
            stmt.setString(3, opp.getPair());
            stmt.setDouble(4, opp.getNetEdge());
            stmt.setDouble(5, pnl);
            Timestamp ts = new Timestamp(System.currentTimeMillis());
            stmt.setTimestamp(6, ts);
            int rows = stmt.executeUpdate();
            if (rows > 0) {
                logger.info("Trade executed: BUY on {} / SELL on {} | Pair: {} | Net Edge: {} | PnL: {}",
                        opp.getBuyExchange(), opp.getSellExchange(), opp.getPair(), opp.getNetEdge(), pnl);
            } else {
                logger.warn("Trade log insert affected 0 rows");
            }
        } catch (SQLException e) {
            logger.error("Failed to log trade", e);
        }
    }

    /**
     * Append a trade outcome to the audit log in JSON format.
     *
     * @param pair        trading pair
     * @param status      outcome status (success, failed, rejected, skipped)
     * @param reason      optional reason for non-success
     * @param slippagePct observed slippage percentage
     * @param latencyMs   round-trip latency in milliseconds
     */
    public static void logAudit(String pair, String status, String reason, double slippagePct, long latencyMs) {
        try {
            java.nio.file.Path path = java.nio.file.Path.of("logs", "trade_audit.log");
            java.nio.file.Files.createDirectories(path.getParent());
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.node.ObjectNode node = mapper.createObjectNode();
            node.put("timestamp", java.time.Instant.now().toString());
            node.put("pair", pair);
            node.put("status", status);
            if (reason != null && !reason.isEmpty()) {
                node.put("reason", reason);
            }
            node.put("slippagePct", slippagePct);
            node.put("latencyMs", latencyMs);
            java.nio.file.Files.writeString(
                    path,
                    node.toString() + System.lineSeparator(),
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (Exception e) {
            logger.error("Failed to write audit log", e);
        }
    }
}

