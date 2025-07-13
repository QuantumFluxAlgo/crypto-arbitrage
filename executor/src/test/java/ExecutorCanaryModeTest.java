package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

/** Tests that Executor bypasses trades when canary mode is enabled. */
@Tag("local")
public class ExecutorCanaryModeTest {
    static class DummyRedisClient extends RedisClient {
        DummyRedisClient() {
            super("localhost", 6379, "chan", (c, m) -> {});
        }
        @Override
        public void start() {}
        @Override
        public void publish(String channel, String message) {}
    }

    static class DummyExecutor extends Executor {
        DummyExecutor() {
            super(new DummyRedisClient(), "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
        }
        @Override
        public void start() {}
    }

    @Test
    void bypassesTradeWhenCanaryMode() {
        ProfitTracker.init(10000, "http://localhost");
        DummyExecutor exec = new DummyExecutor();
        exec.setCanaryMode(true);
        double before = ProfitTracker.getGlobalTotal();
        String msg = "{\"pair\":\"BTC/USDT\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":2.0,\"netEdge\":2.0}";
        exec.handleMessage(msg);
        assertEquals(before, ProfitTracker.getGlobalTotal(), 1e-9, "PnL should not change in canary mode");
    }
}
