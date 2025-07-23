package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class ResumeSafetyTest {

    static class DummyRedisClient extends RedisClient {
        boolean confirmed = false;
        DummyRedisClient() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override
        public boolean isResumeConfirmed() { return confirmed; }
    }

    static class DummyExecutor extends Executor {
        boolean resumed = false;
        DummyExecutor(DummyRedisClient client) {
            super(client, "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.LIVE));
        }
        @Override
        public void resumeFromPanic() { resumed = true; }
    }

    static class StubChecker extends SystemHealthChecker {
        boolean heartbeat = true;
        boolean sweeper = true;
        boolean panic = true;
        @Override public boolean isHeartbeatAlive() { return heartbeat; }
        @Override public boolean isColdSweeperIdle() { return sweeper; }
        @Override public boolean isPanicStateCleared() { return panic; }
    }

    private ResumeController.Response call(DummyExecutor exec, StubChecker chk, DummyRedisClient redis) {
        ResumeController controller = new ResumeController(exec, chk, redis);
        return controller.resume();
    }

    @Test
    void blocksWhenHeartbeatDead() {
        DummyRedisClient redis = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(redis);
        StubChecker chk = new StubChecker();
        chk.heartbeat = false;
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        ResumeController.Response res;
        try {
            res = call(exec, chk, redis);
        } finally {
            System.setErr(orig);
        }
        assertEquals(503, res.status);
        assertTrue(res.body.contains("heartbeat"));
        assertTrue(err.toString().contains("RESUME-BLOCKED"));
        assertFalse(exec.resumed);
    }

    @Test
    void blocksWhenSweeperBusy() {
        DummyRedisClient redis = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(redis);
        StubChecker chk = new StubChecker();
        chk.sweeper = false;
        ResumeController.Response res = call(exec, chk, redis);
        assertEquals(503, res.status);
        assertTrue(res.body.contains("sweeper"));
        assertFalse(exec.resumed);
    }

    @Test
    void blocksWhenPanicFlagSet() {
        DummyRedisClient redis = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(redis);
        StubChecker chk = new StubChecker();
        chk.panic = false;
        ResumeController.Response res = call(exec, chk, redis);
        assertEquals(503, res.status);
        assertTrue(res.body.contains("panicFlag"));
        assertFalse(exec.resumed);
    }
}
