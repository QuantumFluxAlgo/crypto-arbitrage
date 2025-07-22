package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class LatencyBypassBugTest {
    static class DummyRedis extends RedisClient {
        DummyRedis() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override public void start() {}
        @Override public boolean publish(String c, String m) { return true; }
    }

    static class CaptureLogger extends NearMissLogger {
        String reason;
        CaptureLogger() { super(null); }
        @Override public void log(SpreadOpportunity opp, String reason) { this.reason = reason; }
    }

    static class DummyExecutor extends Executor {
        DummyExecutor(CaptureLogger nl) {
            super(new DummyRedis(), "localhost", 6379, new RiskFilter(0.0, 100, 1.0), nl);
        }
        @Override public void start() {}
    }

    @Test
    void dropsStaleOpportunityOnQueueFlush() {
        ProfitTracker.init(10000, "http://localhost");
        CaptureLogger nl = new CaptureLogger();
        DummyExecutor exec = new DummyExecutor(nl);
        long ts = System.currentTimeMillis() - 200;
        String msg = "{\"pair\":\"BTC/USDT\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":2.0,\"netEdge\":2.0,\"latencyMs\":50,\"timestamp\":" + ts + "}";
        exec.handleMessage(msg);
        assertEquals("queue_latency", nl.reason);
    }
}
