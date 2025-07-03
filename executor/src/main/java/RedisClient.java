import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPubSub;

import executor.AlertManager;

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

    public RedisClient(String host, int port, String channel, MessageHandler handler) {
        this.host = host;
        this.port = port;
        this.channel = channel;
        this.handler = handler;
        setName("RedisClientSubscriber");
    }

    public void shutdown() {
        running = false;
        interrupt();
    }

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
