package executor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/** Tests for SandboxExchangeAdapter. */
public class SandboxExchangeAdapterTest {
    /** Dummy redis client capturing publishes. */
    static class DummyRedis extends RedisClient {
        String channel;
        String message;
        DummyRedis() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override public void start() {}
        @Override public void publish(String ch, String msg) { this.channel = ch; this.message = msg; }
    }

    @Test
    void publishesAndReturnsResult() throws Exception {
        DummyRedis redis = new DummyRedis();
        SandboxExchangeAdapter adapter = new SandboxExchangeAdapter(redis, opp -> 0.7);
        SpreadOpportunity opp = new SpreadOpportunity("BTC/USDT", "A", "B", 0.1, 0.1, 0L);
        TradeResult result = adapter.execute(opp, 1.0, 1.0);
        assertNotNull(result);
        assertEquals("ghost_feed", redis.channel);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(redis.message);
        assertEquals("BTC/USDT", node.get("pair").asText());
        assertEquals(0.1, node.get("net_edge").asDouble(), 1e-9);
        assertEquals(0.7, node.get("predicted_prob").asDouble(), 1e-9);
        assertEquals(result.latencyMs, node.get("latency_ms").asLong());
    }
}
