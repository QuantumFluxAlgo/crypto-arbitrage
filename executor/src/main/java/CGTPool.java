package executor;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Tracks pooled acquisition costs for CGT purposes and stores
 * an audit record for each buy/sell event.
 */
public class CGTPool {
    private static final Logger logger = LoggerFactory.getLogger(CGTPool.class);

    /** Represents pooled quantity and total cost for an asset. */
    public static class PoolEntry {
        public double quantity = 0.0;
        public double cost = 0.0;
    }

    private final Map<String, PoolEntry> pools = new HashMap<>();
    private final Connection connection;

    public CGTPool(Connection connection) {
        this.connection = connection;
    }

    public synchronized void recordBuy(String asset, double amount, double price) {
        PoolEntry entry = pools.computeIfAbsent(asset, a -> new PoolEntry());
        entry.quantity += amount;
        entry.cost += amount * price;
        logEvent(asset, "BUY", amount, price, amount * price, 0.0);
    }

    public synchronized double recordSell(String asset, double amount, double price) {
        PoolEntry entry = pools.get(asset);
        if (entry == null || entry.quantity < amount) {
            logger.warn("Insufficient quantity in pool for asset {}", asset);
            return 0.0;
        }
        double avgCost = entry.cost / entry.quantity;
        double costBasis = avgCost * amount;
        entry.quantity -= amount;
        entry.cost -= costBasis;
        double gain = price * amount - costBasis;
        logEvent(asset, "SELL", amount, price, costBasis, gain);
        return gain;
    }

    private void logEvent(String asset, String side, double amount, double price,
                          double costBasis, double gain) {
        if (connection == null) return;
        String sql = "INSERT INTO cgt_audit (timestamp, asset, side, amount, price, cost_basis, gain) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setTimestamp(1, new Timestamp(System.currentTimeMillis()));
            stmt.setString(2, asset);
            stmt.setString(3, side);
            stmt.setDouble(4, amount);
            stmt.setDouble(5, price);
            stmt.setDouble(6, costBasis);
            stmt.setDouble(7, gain);
            stmt.executeUpdate();
        } catch (SQLException e) {
            logger.error("Failed to write CGT audit", e);
        }
    }

    public PoolEntry getEntry(String asset) {
        return pools.get(asset);
    }
}

