package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import redis.clients.jedis.Jedis;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class RedisPubSubTest {
    @Test
    void logsMessageOnResume() throws Exception {
        Process proc = new ProcessBuilder("redis-server", "--port", "6390", "--daemonize", "yes").start();
        Thread.sleep(200);
        RedisClient client = new RedisClient("localhost", 6390, "feed", (c,m)->{});
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        try {
            client.subscribeControl(null, msg -> System.err.println("{\"event\":\"redis_received\",\"message\":\"" + msg + "\"}"));
            try (Jedis jedis = new Jedis("localhost", 6390)) {
                jedis.publish(RedisClient.getControlChannel(), "resume");
            }
            Thread.sleep(100);
        } finally {
            System.setErr(orig);
            client.shutdown();
            proc.destroy();
        }
        String output = err.toString();
        assertTrue(output.contains("\"event\":\"redis_received\""));
        assertTrue(output.contains("resume"));
    }
}
