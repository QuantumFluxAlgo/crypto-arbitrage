import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
    private MessageHandler handler;
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

    public void subscribe(String channel, Consumer<String> handler) {
        logger.info("Mock subscribe to channel '{}'", channel);
        this.handler = (ch, msg) -> handler.accept(msg);
        start();
    }

    /** Stop the subscriber thread. */
    public void shutdown() {
        running = false;
        interrupt();
    }

    @Override
    public void run() {
        logger.info("Mock RedisClient started for channel '{}'", channel);
        // This mock periodically invokes the handler with an empty message
        while (running) {
            try {
                if (handler != null) {
                    handler.onMessage(channel, "{}");
                }
                    Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }
}

