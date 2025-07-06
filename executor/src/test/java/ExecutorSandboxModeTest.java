package executor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/** Tests sandbox mode behaviour. */
public class ExecutorSandboxModeTest {
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

    static class DummyExecutor extends Executor {
        DummyRedisClient client;
        DummyExecutor(DummyRedisClient c) {
            super(c, "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
            this.client = c;
        }
        @Override
        public void start() {}
    }

    @Test
    void publishesSimulatedTradeWhenSandbox() throws Exception {
        ProfitTracker.init(10000, "http://localhost");
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        exec.setSandboxMode(true);
        String msg = "{\"pair\":\"BTC/USDT\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":2.0,\"netEdge\":2.0}";
        exec.handleMessage(msg);
        assertEquals("ghost_feed", client.channel);
        assertNotNull(client.message);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(client.message);
        assertEquals("BTC/USDT", node.get("pair").asText());
        assertEquals(2.0, node.get("net_edge").asDouble(), 1e-9);
        assertEquals(0.0, node.get("predicted_prob").asDouble(), 1e-9);
        assertEquals(2.0, node.get("simulated_pnl").asDouble(), 1e-9);
    }
}
