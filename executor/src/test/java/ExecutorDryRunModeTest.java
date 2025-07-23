package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class ExecutorDryRunModeTest {
    static class DummyRedisClient extends RedisClient {
        String channel;
        String message;
        DummyRedisClient() {
            super("localhost", 6379, "chan", (c,m)->{});
        }
        @Override public void start() {}
        @Override public boolean ping() { return true; }
        @Override public boolean publish(String ch, String msg) { this.channel = ch; this.message = msg; return true; }
    }

    static class DummyExecutor extends Executor {
        DummyRedisClient client;
        DummyExecutor(DummyRedisClient c) {
            super(c, "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.DRY_RUN));
            this.client = c;
        }
        @Override public void start() {}
    }

    @Test
    void noTradeExecutedWhenDryRun() throws Exception {
        ProfitTracker.init(10000, "http://localhost");
        ProfitTracker.resetCumulativeProfit();
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        String msg = "{\"pair\":\"BTC/USDT\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":1.0,\"netEdge\":1.0}";
        exec.handleMessage(msg);
        assertEquals("ghost_feed", client.channel);
        assertEquals(0.0, ProfitTracker.getGlobalTotal(), 1e-9);
    }
}
