package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

/** Tests that Executor publishes opportunities instead of executing when ghost mode is enabled. */
@Tag("local")
public class ExecutorGhostModeTest {
    static class DummyRedisClient extends RedisClient {
        String publishedChannel;
        String publishedMessage;
        DummyRedisClient() {
            super("localhost", 6379, "chan", (c, m) -> {});
        }
        @Override
        public void start() {}
        @Override
        public void publish(String channel, String message) {
            this.publishedChannel = channel;
            this.publishedMessage = message;
        }
    }

    static class DummyExecutor extends Executor {
        DummyRedisClient dummyRedis;
        DummyExecutor(DummyRedisClient client) {
            super(client, "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
            this.dummyRedis = client;
        }
        @Override
        public void start() {}
    }

    @Test
    void broadcastsOpportunityWhenGhostMode() {
        ProfitTracker.init(10000, "http://localhost");
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        exec.setGhostMode(true);
        String msg = "{\"pair\":\"BTC/USDT\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":2.0,\"netEdge\":2.0}";
        exec.handleMessage(msg);
        assertEquals("ghost-feed", client.publishedChannel);
        assertEquals(msg, client.publishedMessage);
    }
}
