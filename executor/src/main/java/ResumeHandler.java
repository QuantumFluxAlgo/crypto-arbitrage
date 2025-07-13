package executor;


import executor.Executor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Listens for "resume" commands on a Redis channel and notifies the
 * associated executor when trading should continue.
 */
public class ResumeHandler {
    private static final String CHANNEL = "control-feed";
     private static final Logger logger = LoggerFactory.getLogger(ResumeHandler.class);

    private final Object redis;
     private final Executor executor;
     private Thread thread;

    /**
     * @param redis     redis connection or client
     * @param executor  executor to be resumed
     */
     public ResumeHandler(Object redis, Executor executor) {
         this.redis = redis;
         this.executor = executor;
     }

    /**
     * Begin listening for resume messages.
     */
    public void start() {
        thread = new Thread(() -> {
            int attempt = 0;
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    if (redis instanceof redis.clients.jedis.Jedis jedis) {
                        jedis.subscribe(new redis.clients.jedis.JedisPubSub() {
                            @Override
                            public void onMessage(String channel, String message) {
                                if ("resume".equalsIgnoreCase(message)) {
                                    logger.info("Received 'resume' command from Redis");
                                    executor.resumeFromPanic();
                                }
                            }
                        }, CHANNEL);
                    } else if (redis instanceof RedisClient client) {
                        client.subscribe(new redis.clients.jedis.JedisPubSub() {
                            @Override
                            public void onMessage(String channel, String message) {
                                if ("resume".equalsIgnoreCase(message)) {
                                    logger.info("Received 'resume' command from Redis");
                                    executor.resumeFromPanic();
                                }
                            }
                        }, CHANNEL);
                    }
                    attempt = 0;
                } catch (Exception e) {
                    long delay = Math.min(30000L, (1L << attempt) * 1000L);
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

    /**
     * Simple capability interface implemented by classes that can resume
     * from a panic brake state.
     */
    public interface ResumeCapable {
        /** Trigger resumption of normal trading. */
        void resumeFromPanic();
    }
}
