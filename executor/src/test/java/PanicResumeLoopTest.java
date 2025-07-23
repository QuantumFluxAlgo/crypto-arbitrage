package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class PanicResumeLoopTest {
    static class StubRedisClient extends RedisClient {
        MessageHandler feedHandler;
        java.util.function.Consumer<String> controlHandler;
        StubRedisClient() { super("localhost", 6379, "feed", (c,m)->{}, 1L, 2L); }
        @Override public void start() {}
        @Override public boolean ping() { return true; }
        @Override public void subscribe(String channel, MessageHandler handler) { feedHandler = handler; }
        @Override public void subscribeControl(Config config, java.util.function.Consumer<String> handler) { controlHandler = handler; }
        void sendFeed(String msg) { if (feedHandler != null) feedHandler.onMessage("feed", msg); }
        void sendControl(String msg) { if (controlHandler != null) controlHandler.accept(msg); }
    }

    static class DummyExecutor extends Executor {
        int processed = 0;
        java.util.concurrent.atomic.AtomicBoolean panicRef;
        DummyExecutor(StubRedisClient client) throws Exception {
            super(client, "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.LIVE));
            java.lang.reflect.Field f = Executor.class.getDeclaredField("isPanic");
            f.setAccessible(true);
            panicRef = (java.util.concurrent.atomic.AtomicBoolean) f.get(this);
        }
        @Override public void start() { setupControlSubscription(); }
        @Override public void handleMessage(String msg) {
            if ("panic".equals(msg)) {
                panicRef.set(true);
            } else if (!panicRef.get()) {
                processed++;
            }
        }
    }

    @Test
    void panicHaltsUntilResume() throws Exception {
        StubRedisClient client = new StubRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        exec.start();
        client.subscribe("feed", (c,m) -> exec.handleMessage(m));

        client.sendFeed("trade1");
        assertEquals(1, exec.processed);

        client.sendFeed("panic");
        client.sendFeed("trade2");
        assertEquals(1, exec.processed);

        client.sendControl("resume");
        Thread.sleep(50);
        client.sendFeed("trade3");
        assertEquals(2, exec.processed);
    }
}
