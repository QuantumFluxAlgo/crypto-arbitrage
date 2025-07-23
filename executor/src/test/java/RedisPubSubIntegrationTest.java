package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class RedisPubSubIntegrationTest {
    @Test
    void receivesResumeMessage() throws Exception {
        Process redis = new ProcessBuilder("redis-server", "--port", "6390").start();
        Thread.sleep(500);
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PrintStream orig = System.out;
            System.setOut(new PrintStream(out));
            RedisClient sub = new RedisClient("localhost", 6390, "feed", (c,m)->{});
            sub.subscribeControl(null, msg -> System.out.println("{\"event\":\"redis_received\",\"message\":\"" + msg + "\"}"));
            Thread.sleep(500);
            RedisClient pub = new RedisClient("localhost", 6390, "feed", (c,m)->{});
            pub.publishControl(null, "resume");
            boolean logged = false;
            for (int i=0;i<10;i++) {
                if (out.toString().contains("\"redis_received\"")) { logged = true; break; }
                Thread.sleep(100);
            }
            System.setOut(orig);
            assertTrue(logged, "resume message not logged");
            assertTrue(out.toString().contains("\"message\":\"resume\""));
            sub.shutdown();
            pub.shutdown();
        } finally {
            redis.destroy();
        }
    }
}
