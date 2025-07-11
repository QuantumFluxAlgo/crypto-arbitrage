package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;

import executor.AlertManager;
import java.util.function.Consumer;

/**
 * Lightweight Redis pub/sub client used for messaging between agents.
 */
public class RedisClient extends Thread {
    private static final Logger logger = LoggerFactory.getLogger(RedisClient.class);

    public interface MessageHandler {
        void onMessage(String channel, String message);
    }

    private final String host;
    private final int port;
    private final String channel;
    private final MessageHandler handler;
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
        this.host = host;
        this.port = port;
        this.channel = channel;
        this.handler = handler;
        setName("RedisClientSubscriber");
    }

    /**
     * Publish a message to the given channel.
     *
     * @param channel redis channel
     * @param message payload to publish
     */
    public void publish(String channel, String message) {
        try (Jedis jedis = new Jedis(host, port)) {
            jedis.publish(channel, message);
        } catch (Exception e) {
            logger.error("Redis publish failed: {}", e.getMessage());
        }
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
            try (Jedis jedis = new Jedis(host, port)) {
                jedis.subscribe(listener, channels);
            } catch (Exception e) {
                logger.error("Redis subscribe failed: {}", e.getMessage());
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
     * Stop the subscription thread and close connections.
     */
    public void shutdown() {
        running = false;
        interrupt();
    }

    /** {@inheritDoc} */
    @Override
    public void run() {
        int attempt = 0;
        while (running) {
            try (Jedis jedis = new Jedis(host, port)) {
                logger.info("Subscribed to {}", channel);
                jedis.subscribe(new JedisPubSub() {
                    @Override
                    public void onMessage(String ch, String message) {
                        handler.onMessage(ch, message);
                    }
                }, channel);
                attempt = 0;
            } catch (Exception e) {
                long delay = Math.min(30000, (1 << attempt) * 1000L);
                logger.error("Redis connection failed: {}", e.getMessage());
                AlertManager.sendAlert("Redis connection lost: " + e.getMessage());
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    handler.onMessage(channel, "{}");
                }
                attempt++;
            }
        }
    }
}
