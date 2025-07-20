package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class ResumeSafetyTest {

    static class DummyExecutor extends Executor {
        boolean resumed = false;
        DummyExecutor() {
            super(new RedisClient("localhost", 6379, "chan", (c,m)->{}),
                  "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.LIVE));
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

    private ResumeController.Response call(DummyExecutor exec, StubChecker chk) {
        ResumeController controller = new ResumeController(exec, chk);
        return controller.resume();
    }

    @Test
    void blocksWhenHeartbeatDead() {
        DummyExecutor exec = new DummyExecutor();
        StubChecker chk = new StubChecker();
        chk.heartbeat = false;
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        ResumeController.Response res;
        try {
            res = call(exec, chk);
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
        DummyExecutor exec = new DummyExecutor();
        StubChecker chk = new StubChecker();
        chk.sweeper = false;
        ResumeController.Response res = call(exec, chk);
        assertEquals(503, res.status);
        assertTrue(res.body.contains("sweeper"));
        assertFalse(exec.resumed);
    }

    @Test
    void blocksWhenPanicFlagSet() {
        DummyExecutor exec = new DummyExecutor();
        StubChecker chk = new StubChecker();
        chk.panic = false;
        ResumeController.Response res = call(exec, chk);
        assertEquals(503, res.status);
        assertTrue(res.body.contains("panicFlag"));
        assertFalse(exec.resumed);
    }
}
