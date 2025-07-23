package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class PanicResumeLoopTest {
    static class LocalRedisClient extends RedisClient {
        java.util.function.Consumer<String> control;
        LocalRedisClient() { super("localhost", 6379, "feed", (c,m)->{}); }
        @Override public void start() { }
        @Override public boolean ping() { return true; }
        @Override public void subscribeControl(Config config, java.util.function.Consumer<String> handler) { this.control = handler; }
        void sendControl(String msg) { if (control != null) control.accept(msg); }
        @Override public boolean isPaused() { return panicFlag.get(); }
        private final java.util.concurrent.atomic.AtomicBoolean panicFlag = new java.util.concurrent.atomic.AtomicBoolean(false);
        @Override public boolean publish(String ch, String msg) { return true; }
    }

    static class DummyExecutor extends Executor {
        int processed = 0;
        DummyExecutor(LocalRedisClient c) {
            super(c, "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
        }
        @Override public void start() { setupControlSubscription(); }
        @Override public void handleMessage(String msg) {
            super.handleMessage(msg);
            processed++;
        }
    }

    @Test
    void haltsAndResumesEvaluationLoop() throws Exception {
        LocalRedisClient client = new LocalRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        exec.start();

        String msg = "{\"pair\":\"A/B\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":1.0,\"netEdge\":1.0}";
        exec.handleMessage(msg);
        assertEquals(1, exec.processed);

        client.panicFlag.set(true);
        client.sendControl("halt");
        Thread.sleep(50);
        exec.handleMessage(msg);
        assertEquals(1, exec.processed, "evaluation should halt when panic");

        client.panicFlag.set(false);
        client.sendControl("resume");
        Thread.sleep(50);
        exec.handleMessage(msg);
        assertEquals(2, exec.processed, "evaluation should resume after signal");
    }
}
