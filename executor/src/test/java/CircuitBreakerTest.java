package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

/** Unit tests for {@link CircuitBreaker}. */
@Tag("local")
public class CircuitBreakerTest {
    static class DummyRedisClient extends RedisClient {
        String channel;
        String message;
        DummyRedisClient() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override public void start() {}
        @Override public void publish(String ch, String msg) { channel = ch; message = msg; }
    }

    @Test
    void tripsOnLowWinRate() {
        DummyRedisClient client = new DummyRedisClient();
        CircuitBreaker cb = new CircuitBreaker(client, 0.5, 5.0);
        cb.check(0.4, 1.0);
        assertTrue(cb.isTripped());
        assertEquals("control-feed", client.channel);
        assertEquals("halt", client.message);
    }

    @Test
    void noTripWhenWithinLimits() {
        DummyRedisClient client = new DummyRedisClient();
        CircuitBreaker cb = new CircuitBreaker(client, 0.5, 5.0);
        cb.check(0.6, 1.0);
        assertFalse(cb.isTripped());
    }
}

