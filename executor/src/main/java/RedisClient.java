package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import executor.AlertManager;
import java.util.function.Consumer;

/**
 * Lightweight Redis pub/sub client used for messaging between agents.
 */
public class RedisClient extends Thread {
    private static final Logger logger = LoggerFactory.getLogger(RedisClient.class);
    public static final String PAUSE_KEY = "arb:paused_state";
    public static final String RESUME_ACK_KEY = "resume_ack";

    public interface MessageHandler {
        void onMessage(String channel, String message);
    }

    private final String host;
    private final int port;
    private final String channel;
    private final MessageHandler handler;
    private final long baseDelayMs;
    private final long maxDelayMs;
    private final Map<String, MessageHandler> subscriptionMap = new ConcurrentHashMap<>();
    private volatile boolean running = true;

    /**
     * Create a new Redis client instance.
     *
     * @param host    redis host
     * @param port    redis port
     * @param channel subscription channel
     * @param handler callback for incoming messages
     */
    public RedisClient(String host, int port, String channel, MessageHandler handler) {
        this(host, port, channel, handler, getBaseDelayMs(), getMaxDelayMs());
    }

    public RedisClient(String host, int port, String channel, MessageHandler handler,
                       long baseDelayMs, long maxDelayMs) {
        this.host = host;
        this.port = port;
        this.channel = channel;
        this.handler = handler;
        this.baseDelayMs = baseDelayMs;
        this.maxDelayMs = maxDelayMs;
        subscriptionMap.put(channel, handler);
        setName("RedisClientSubscriber");
    }

    /** Register additional subscription for reconnect tracking */
    public void addSubscription(String channel, MessageHandler handler) {
        subscriptionMap.put(channel, handler);
    }

    static long getBaseDelayMs() {
        String val = System.getProperty("REDIS_BASE_DELAY_MS",
                System.getenv().getOrDefault("REDIS_BASE_DELAY_MS", "1000"));
        try {
            return Long.parseLong(val);
        } catch (NumberFormatException e) {
            return 1000L;
        }
    }

    static long getMaxDelayMs() {
        String val = System.getProperty("REDIS_MAX_DELAY_MS",
                System.getenv().getOrDefault("REDIS_MAX_DELAY_MS", "60000"));
        try {
            return Long.parseLong(val);
        } catch (NumberFormatException e) {
            return 60000L;
        }
    }

    static String getControlChannel() {
        String env = System.getenv().getOrDefault("NODE_ENV", "development");
        return "control-feed-" + env;
    }

    /**
     * Publish a message to the given channel.
     *
     * @param channel redis channel
     * @param message payload to publish
     */
    public boolean publish(String channel, String message) {
        int attempts = 0;
        while (attempts < 3) {
            try (Jedis jedis = new Jedis(host, port)) {
                jedis.publish(channel, message);
                return true;
            } catch (Exception e) {
                attempts++;
                long delay = Math.min(maxDelayMs, (1L << (attempts - 1)) * baseDelayMs);
                logger.error("Redis publish failed (attempt {}): {}", attempts, e.getMessage());
                if (attempts >= 3) {
                    logger.error("Redis publish giving up after {} attempts", attempts);
                    break;
                }
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        return false;
    }

    /**
     * Publish a message to the control channel derived from execution mode.
     */
    public boolean publishControl(Config config, String message) {
        String channel;
        if (config == null) {
            channel = getControlChannel();
        } else {
            channel = getControlChannel();
        }
        return publish(channel, message);
    }

    /**
     * Subscribe with a provided {@link JedisPubSub} listener.
     * A new thread will be created for the subscription.
     *
     * @param listener JedisPubSub instance
     * @param channels channels to subscribe to
     */
    public void subscribe(JedisPubSub listener, String... channels) {
        new Thread(() -> {
            int attempt = 0;
            while (running && attempt < 10) {
                try (Jedis jedis = new Jedis(host, port)) {
                    if (attempt > 0) {
                        logger.info("Redis reconnected — subscriptions restored: {}", Arrays.toString(channels));
                    }
                    jedis.subscribe(listener, channels);
                    attempt = 0;
                } catch (Exception e) {
                    attempt++;
                    if (attempt >= 10) {
                        logger.error("Redis connection failed after 10 retries");
                        break;
                    }
                    long delay = Math.min(maxDelayMs, (1L << (attempt - 1)) * baseDelayMs);
                    logger.error("Redis subscribe failed: {}", e.getMessage());
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }, "RedisClientSubscribe-" + String.join(",", channels)).start();
    }

    /**
     * Subscribe to a channel with a {@link MessageHandler} implementation.
     *
     * @param channel  Redis channel
     * @param handler  callback invoked for each message
     */
    public void subscribe(String channel, MessageHandler handler) {
        addSubscription(channel, handler);
        subscribe(new JedisPubSub() {
            @Override
            public void onMessage(String ch, String message) {
                handler.onMessage(ch, message);
            }
        }, channel);
    }

    /**
     * Subscribe to a channel using a simple message consumer.
     * @param channel Redis channel
     * @param handler consumer invoked with each message
     */
    public void subscribe(String channel, Consumer<String> handler) {
        subscribe(channel, (ch, msg) -> handler.accept(msg));
    }

    /**
     * Subscribe to the control channel derived from execution mode.
     */
    public void subscribeControl(Config config, Consumer<String> handler) {
        String channel;
        if (config == null) {
            channel = getControlChannel();
        } else {
            channel = getControlChannel();
        }
        subscribe(channel, handler);
    }

    /**
     * Stop the subscription thread and close connections.
     */
    public void shutdown() {
        running = false;
        interrupt();
    }

    /**
     * Ping Redis to check availability.
     *
     * @return true if Redis responds with PONG
     */
    public boolean ping() {
        try (Jedis jedis = new Jedis(host, port)) {
            return "PONG".equalsIgnoreCase(jedis.ping());
        } catch (Exception e) {
            logger.error("Redis ping failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if resume has been confirmed in Redis.
     */
    public boolean isResumeConfirmed() {
        try (Jedis jedis = new Jedis(host, port)) {
            String val = jedis.get("resume_confirmed");
            return val != null && val.equalsIgnoreCase("true");
        } catch (Exception e) {
            logger.error("Redis read failed: {}", e.getMessage());
            return false;
        }
    }

    /** Check if trading is paused */
    public boolean isPaused() {
        try (Jedis jedis = new Jedis(host, port)) {
            String val = jedis.get(PAUSE_KEY);
            return val != null && val.equalsIgnoreCase("true");
        } catch (Exception e) {
            logger.error("Redis read failed: {}", e.getMessage());
            return true;
        }
    }

    /** Record resume acknowledgement */
    public void setResumeAck() {
        try (Jedis jedis = new Jedis(host, port)) {
            jedis.setex(RESUME_ACK_KEY, 60, "true");
        } catch (Exception e) {
            logger.error("Redis write failed: {}", e.getMessage());
        }
    }

    /** {@inheritDoc} */
    @Override
    public void run() {
        int attempt = 0;
        if (!subscriptionMap.containsKey(channel)) {
            subscriptionMap.put(channel, handler);
        }
        while (running && attempt < 10) {
            String[] channels = subscriptionMap.keySet().toArray(new String[0]);
            try (Jedis jedis = new Jedis(host, port)) {
                if (attempt > 0) {
                    logger.info("Redis reconnected \u2014 subscriptions restored: {}", Arrays.toString(channels));
                } else {
                    logger.info("Subscribed to {}", Arrays.toString(channels));
                }
                JedisPubSub pubSub = new JedisPubSub() {
                    @Override
                    public void onMessage(String ch, String message) {
                        MessageHandler h = subscriptionMap.get(ch);
                        if (h != null) h.onMessage(ch, message);
                    }
                };
                jedis.subscribe(pubSub, channels);
                attempt = 0;
            } catch (Exception e) {
                attempt++;
                if (attempt >= 10) {
                    logger.error("Redis connection failed after 10 retries");
                    break;
                }
                long delay = Math.min(maxDelayMs, (1L << (attempt - 1)) * baseDelayMs);
                logger.error("Redis connection failed: {}", e.getMessage());
                AlertManager.sendAlert("REDIS", "connection lost: " + e.getMessage());
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    handler.onMessage(channel, "{}");
                }
            }
        }
    }
}
