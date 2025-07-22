package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import executor.RedisClient;

/**
 * Listens for "sweep" commands on a Redis channel and triggers the cold wallet sweep.
 */
public class SweepHandler {
    private static final String CHANNEL = RedisClient.getControlChannel();
    private static final Logger logger = LoggerFactory.getLogger(SweepHandler.class);

    private final Object redis;
    private final ColdSweeper sweeper;
    private final long baseDelayMs;
    private final long maxDelayMs;
    private Thread thread;

    /**
     * @param redis   redis connection or client
     * @param sweeper cold sweeper instance
     */
    public SweepHandler(Object redis, ColdSweeper sweeper) {
        this(redis, sweeper, ResumeHandler.getBaseDelayMs(), ResumeHandler.getMaxDelayMs());
    }

    public SweepHandler(Object redis, ColdSweeper sweeper, long baseDelayMs, long maxDelayMs) {
        this.redis = redis;
        this.sweeper = sweeper;
        this.baseDelayMs = baseDelayMs;
        this.maxDelayMs = maxDelayMs;
    }

    /** Begin listening for sweep messages. */
    public void start() {
        thread = new Thread(() -> {
            int attempt = 0;
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    if (redis instanceof redis.clients.jedis.Jedis jedis) {
                        jedis.subscribe(new redis.clients.jedis.JedisPubSub() {
                            @Override
                            public void onMessage(String channel, String message) {
                                if ("sweep".equalsIgnoreCase(message)) {
                                    logger.info("Received 'sweep' command from Redis");
                                    double amount = ProfitTracker.getCumulativeProfit();
                                    sweeper.sweepToColdWallet(amount);
                                }
                            }
                        }, CHANNEL);
                        break;
                    } else if (redis instanceof RedisClient client) {
                        client.subscribe(new redis.clients.jedis.JedisPubSub() {
                            @Override
                            public void onMessage(String channel, String message) {
                                if ("sweep".equalsIgnoreCase(message)) {
                                    logger.info("Received 'sweep' command from Redis");
                                    double amount = ProfitTracker.getCumulativeProfit();
                                    sweeper.sweepToColdWallet(amount);
                                }
                            }
                        }, CHANNEL);
                        break;
                    }
                    attempt = 0;
                } catch (Exception e) {
                    long delay = Math.min(maxDelayMs, (1L << attempt) * baseDelayMs);
                    logger.error("Redis subscription failed: {}", e.getMessage());
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                    attempt++;
                }
            }
        });
        thread.start();
    }
}
