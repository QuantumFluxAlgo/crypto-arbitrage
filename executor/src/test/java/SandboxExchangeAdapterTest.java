package executor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

/** Tests for SandboxExchangeAdapter. */
@Tag("local")
public class SandboxExchangeAdapterTest {
    /** Dummy redis client capturing publishes. */
    static class DummyRedis extends RedisClient {
        String channel;
        String message;
        DummyRedis() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override public void start() {}
        @Override public boolean publish(String ch, String msg) { this.channel = ch; this.message = msg; return true; }
    }

    @Test
    void publishesAndReturnsResult() throws Exception {
        DummyRedis redis = new DummyRedis();
        SandboxExchangeAdapter adapter = new SandboxExchangeAdapter(redis, opp -> 0.7, new Random(42));
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
        assertEquals(result.pnl, node.get("simulated_pnl").asDouble(), 1e-9);
        assertTrue(result.pnl <= 0.1);
    }

    @Test
    void invalidEnvValuesFallbackToDefaults() {
        System.setProperty("SANDBOX_SLIPPAGE", "bad");
        System.setProperty("SANDBOX_FEE", "oops");
        System.setProperty("SANDBOX_LATENCY_MS", "wrong");

        DummyRedis redis = new DummyRedis();
        SandboxExchangeAdapter adapter = new SandboxExchangeAdapter(redis, o -> 0.5, new Random(1));

        assertEquals(0.001, adapter.getFeeRate("BTC/USDT"), 1e-9);
        assertDoesNotThrow(() -> adapter.placeOrder("BTC/USDT", "BUY", 1.0, 1.0));

        System.clearProperty("SANDBOX_SLIPPAGE");
        System.clearProperty("SANDBOX_FEE");
        System.clearProperty("SANDBOX_LATENCY_MS");
    }
}
