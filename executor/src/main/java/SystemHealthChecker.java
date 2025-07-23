package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;

/**
 * Performs runtime checks to verify whether it is safe to resume trading.
 */
public class SystemHealthChecker {
    private static final Logger logger = LoggerFactory.getLogger(SystemHealthChecker.class);

    private final Executor executor;
    private final ColdSweeper sweeper;

    public SystemHealthChecker() {
        this(null, null);
    }

    public SystemHealthChecker(Executor executor, ColdSweeper sweeper) {
        this.executor = executor;
        this.sweeper = sweeper;
    }

    /** Check that heartbeat monitor is alive. */
    public boolean isHeartbeatAlive() {
        String redisUrl = System.getenv().getOrDefault("REDIS_URL", "redis://localhost:6379");
        String host = "localhost";
        int port = 6379;
        try {
            java.net.URI uri = new java.net.URI(redisUrl);
            if (uri.getHost() != null) host = uri.getHost();
            if (uri.getPort() != -1) port = uri.getPort();
            logger.info("[REDIS] Connected to {}:{} via REDIS_URL", host, port);
        } catch (Exception e) {
            logger.error("[REDIS] Invalid REDIS_URL: {}", e.getMessage());
        }
        try (Jedis jedis = new Jedis(host, port)) {
            String ts = jedis.get("executor:heartbeat");
            if (ts == null) {
                return false;
            }
            long last = Long.parseLong(ts);
            return System.currentTimeMillis() - last < 10000;
        } catch (Exception e) {
            logger.error("Heartbeat check failed", e);
            return false;
        }
    }

    /** Check that the cold sweeper is not actively running. */
    public boolean isColdSweeperIdle() {
        return sweeper == null || !sweeper.isBusy();
    }

    /** Check that panic flag has been cleared. */
    public boolean isPanicStateCleared() {
        return executor == null || !executor.isPanicActive();
    }
}
