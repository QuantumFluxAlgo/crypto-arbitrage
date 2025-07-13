package executor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

import static org.junit.jupiter.api.Assertions.*;

/** Unit tests for {@link SimulatedPublisher}. */
@Tag("local")
public class SimulatedPublisherTest {
    /** Simple Redis client capturing the last published message. */
    static class DummyRedisClient extends RedisClient {
        String channel;
        String message;
        DummyRedisClient() {
            super("localhost", 6379, "chan", (c, m) -> {});
        }
        @Override
        public void start() {}
        @Override
        public void publish(String ch, String msg) {
            this.channel = ch;
            this.message = msg;
        }
    }

    @Test
    void publishesWhenGhostModeEnabled() throws Exception {
        DummyRedisClient client = new DummyRedisClient();
        SimulatedPublisher publisher = new SimulatedPublisher(client, true);
        publisher.publish("BTC/USDT", 0.1, 0.8, 15L, 12.5);
        assertEquals("ghost_feed", client.channel);
        assertNotNull(client.message);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(client.message);
        assertEquals("BTC/USDT", node.get("pair").asText());
        assertEquals(0.1, node.get("net_edge").asDouble(), 1e-9);
        assertEquals(0.8, node.get("predicted_prob").asDouble(), 1e-9);
        assertEquals(15L, node.get("latency_ms").asLong());
        assertEquals(12.5, node.get("simulated_pnl").asDouble(), 1e-9);
    }

    @Test
    void doesNotPublishWhenGhostModeDisabled() {
        DummyRedisClient client = new DummyRedisClient();
        SimulatedPublisher publisher = new SimulatedPublisher(client, false);
        publisher.publish("BTC/USDT", 0.1, 0.8, 15L, 12.5);
        assertNull(client.message);
    }
}
