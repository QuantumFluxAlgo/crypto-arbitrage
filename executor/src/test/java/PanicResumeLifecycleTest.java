package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class PanicResumeLifecycleTest {
    static class DummyRedis extends RedisClient {
        boolean paused = true;
        boolean ack = false;
        int publishes = 0;
        DummyRedis() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override public void start() {}
        @Override public boolean ping() { return true; }
        @Override public boolean publish(String ch, String msg) { publishes++; return true; }
        @Override public boolean isPaused() { return paused; }
        @Override public void setResumeAck() { ack = true; }
    }

    static class DummyExecutor extends Executor {
        DummyRedis client;
        DummyExecutor(DummyRedis c) {
            super(c, "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.DRY_RUN));
            this.client = c;
            setSandboxMode(true);
        }
        @Override public void start() {}
    }

    @Test
    void skipsWhenPausedThenResumes() {
        ProfitTracker.init(10000, "http://localhost");
        DummyRedis redis = new DummyRedis();
        DummyExecutor exec = new DummyExecutor(redis);
        String msg = "{\"pair\":\"BTC/USDT\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":1.0,\"netEdge\":1.0}";
        exec.handleMessage(msg);
        assertEquals(0, redis.publishes);
        redis.paused = false;
        exec.resumeFromPanic();
        exec.handleMessage(msg);
        assertTrue(redis.ack);
        assertEquals(1, redis.publishes);
    }
}
