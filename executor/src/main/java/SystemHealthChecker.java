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
        String host = System.getenv().getOrDefault("REDIS_HOST", "localhost");
        int port = Integer.parseInt(System.getenv().getOrDefault("REDIS_PORT", "6379"));
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
