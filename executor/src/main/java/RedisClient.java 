import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;

import java.util.function.Consumer;

/**
 * Redis client subscriber that listens to the {@code spread-feed} channel or a custom one.
 * Runs in its own thread and reconnects automatically on failure.
 */
public class RedisClient extends Thread {
    private static final Logger logger = LoggerFactory.getLogger(RedisClient.class);

    /** Callback interface for channel + message. */
    public interface MessageHandler {
        void onMessage(String channel, String message);
    }

    private final String host;
    private final int port;
    private final String channel;
    private final MessageHandler handler;
    private volatile boolean running = true;

    public RedisClient(String host, int port, String channel, MessageHandler handler) {
        this.host = host;
        this.port = port;
        this.channel = channel;
        this.handler = handler;
        setName("RedisClientSubscriber");
    }

    public RedisClient(String host, int port, Consumer<String> simpleHandler) {
        this(host, port, "spread-feed", (channel, message) -> simpleHandler.accept(message));
    }

    /** Stop the subscriber thread. */
    public void shutdown() {
        running = false;
        interrupt();
    }

    @Override
    public void run() {
        logger.info("Subscribed to Redis channel '{}'", channel);
        while (running) {
            try (Jedis jedis = new Jedis(host, port)) {
                jedis.subscribe(new JedisPubSub() {
                    @Override
                    public void onMessage(String ch, String msg) {
                        if (handler != null) {
                            handler.onMessage(ch, msg);
                        }
                    }
                }, channel);
            } catch (Exception e) {
                if (running) {
                    logger.error("Redis subscriber error, reconnecting", e);
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                }
            }
        }
    }
}

