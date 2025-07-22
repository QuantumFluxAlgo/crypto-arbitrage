package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import executor.Config;
import executor.ExecutionMode;
import executor.RiskFilter;
import executor.NearMissLogger;

import static org.junit.jupiter.api.Assertions.*;

/** Ensures Executor continues processing after Redis reconnects. */
@Tag("local")
public class ExecutorRedisRecoveryTest {
    /** Redis client stub for feed and control channels. */
    static class StubRedisClient extends RedisClient {
        MessageHandler feedHandler;
        java.util.function.Consumer<String> controlHandler;
        StubRedisClient() { super("localhost", 6379, "chan", (c,m)->{}, 1L, 2L); }
        @Override public void start() {}
        @Override public boolean ping() { return true; }
        @Override public void subscribe(String channel, MessageHandler handler) { feedHandler = handler; }
        @Override public void subscribeControl(Config config, java.util.function.Consumer<String> handler) { controlHandler = handler; }
        void sendFeed(String msg) { if (feedHandler != null) feedHandler.onMessage("chan", msg); }
        void sendControl(String msg) { if (controlHandler != null) controlHandler.accept(msg); }
    }

    /** Executor capturing handled messages. */
    static class DummyExecutor extends Executor {
        int count = 0;
        StubRedisClient client;
        DummyExecutor(StubRedisClient client) {
            super(client, "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.LIVE));
            this.client = client;
        }
        @Override public void start() { setupControlSubscription(); }
        @Override public void handleMessage(String msg) {
            if (msg == null || msg.trim().isEmpty() || msg.equals("{}")) return;
            try {
                java.lang.reflect.Field f = Executor.class.getDeclaredField("isPanic");
                f.setAccessible(true);
                java.util.concurrent.atomic.AtomicBoolean p = (java.util.concurrent.atomic.AtomicBoolean) f.get(this);
                if (p.get()) return;
            } catch (Exception ignored) {}
            count++;
        }
    }

    @Test
    void resumesAfterControlSignal() throws Exception {
        StubRedisClient client = new StubRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        exec.start();
        client.subscribe("chan", (c,m) -> exec.handleMessage(m));

        java.lang.reflect.Field f = Executor.class.getDeclaredField("isPanic");
        f.setAccessible(true);
        ((java.util.concurrent.atomic.AtomicBoolean)f.get(exec)).set(true);

        client.sendFeed("{\"pair\":\"A/B\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":1.0,\"netEdge\":1.0}");
        assertEquals(0, exec.count);

        client.sendControl("resume");
        client.sendFeed("{\"pair\":\"C/D\",\"buyExchange\":\"C\",\"sellExchange\":\"D\",\"grossEdge\":1.0,\"netEdge\":1.0}");
        assertEquals(1, exec.count);
    }
}
