package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/** Tests that Executor enforces the MAX_OPEN_TRADES limit. */
@Tag("local")
public class ExecutorMaxOpenTradesTest {
    static class DummyRedisClient extends RedisClient {
        DummyRedisClient() { super("localhost", 6379, "chan", (c,m) -> {}); }
        @Override public void start() {}
        @Override public boolean publish(String channel, String message) { return true; }
    }

    static class DummyExecutor extends Executor {
        DummyExecutor() {
            super(new DummyRedisClient(), "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
        }
        @Override public void start() {}
    }

    @Test
    void skipsTradesWhenLimitReached() {
        ProfitTracker.init(10000, "http://localhost");
        System.setProperty("MAX_OPEN_TRADES", "0");
        DummyExecutor exec = new DummyExecutor();
        String msg = "{\"pair\":\"BTC/USDT\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":2.0,\"netEdge\":2.0}";
        exec.handleMessage(msg); // should be skipped due to limit 0
        assertEquals(0.0, ProfitTracker.getGlobalTotal(), 1e-9);
    }
}

