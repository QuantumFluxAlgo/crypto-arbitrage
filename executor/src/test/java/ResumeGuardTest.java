package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class ResumeGuardTest {
    static class DummyRedis extends RedisClient {
        DummyRedis() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override public void start() {}
    }

    static class DummyExecutor extends Executor {
        DummyExecutor() {
            super(new DummyRedis(), "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
        }
        @Override public void start() {}
    }

    @Test
    void warnsWhenAlreadyResumed() {
        DummyExecutor exec = new DummyExecutor();
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        try {
            exec.resumeFromPanic();
        } finally {
            System.setErr(orig);
        }
        assertTrue(err.toString().contains("RESUME IGNORED"));
    }
}
