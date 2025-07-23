package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class DryRunPanicResumeTest {
    static class DummyRedis extends RedisClient {
        DummyRedis() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override public void start() {}
        @Override public boolean ping() { return true; }
    }

    static class DummyExecutor extends Executor {
        DummyExecutor() {
            super(new DummyRedis(), "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.DRY_RUN));
        }
        @Override public void start() {}
    }

    @Test
    void resumeClearsPanicFlag() throws Exception {
        DummyExecutor exec = new DummyExecutor();
        Field f = Executor.class.getDeclaredField("isPanic");
        f.setAccessible(true);
        ((java.util.concurrent.atomic.AtomicBoolean)f.get(exec)).set(true);
        exec.resumeFromPanic();
        assertTrue(((java.util.concurrent.atomic.AtomicBoolean)f.get(exec)).get(), "panic flag should remain set in dry-run");
    }
}
