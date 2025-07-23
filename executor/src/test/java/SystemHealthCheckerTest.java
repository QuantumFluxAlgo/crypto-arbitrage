package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import redis.embedded.RedisServer;
import redis.clients.jedis.Jedis;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class SystemHealthCheckerTest {
    @Test
    void heartbeatDetectionWorks() throws Exception {
        RedisServer redis = new RedisServer(6379);
        redis.start();
        try (Jedis jedis = new Jedis("localhost", 6379)) {
            jedis.set("executor:heartbeat", String.valueOf(System.currentTimeMillis()));
            SystemHealthChecker chk = new SystemHealthChecker(null, null);
            assertTrue(chk.isHeartbeatAlive(), "heartbeat should be alive");
            jedis.set("executor:heartbeat", String.valueOf(System.currentTimeMillis() - 20000));
            assertFalse(chk.isHeartbeatAlive(), "stale heartbeat should fail");
        } finally {
            redis.stop();
        }
    }

    static class StubExecutor extends Executor {
        boolean panic = false;
        StubExecutor() {
            super(new RedisClient("localhost", 6379, "c", (c,m)->{}), "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.LIVE));
        }
        @Override
        public boolean isPanicActive() { return panic; }
    }

    static class StubSweeper extends ColdSweeper {
        private boolean busy = false;
        private boolean cooldown = false;
        StubSweeper() { super(0,0,new MockWalletClient(), new ColdSweeperConfig(), null, new Config(ExecutionMode.LIVE),0); }
        void setBusy(boolean b) { this.busy = b; }
        void setCooldown(boolean c) { this.cooldown = c; }
        @Override public boolean isBusy() { return busy; }
        @Override public boolean isCooldownActive() { return cooldown; }
    }

    @Test
    void panicAndSweeperChecks() {
        StubExecutor exec = new StubExecutor();
        StubSweeper sweeper = new StubSweeper();
        SystemHealthChecker chk = new SystemHealthChecker(exec, sweeper);

        exec.panic = true;
        assertFalse(chk.isPanicStateCleared());
        exec.panic = false;
        assertTrue(chk.isPanicStateCleared());

        sweeper.setBusy(true);
        assertFalse(chk.isColdSweeperIdle());
        sweeper.setBusy(false);
        sweeper.setCooldown(true);
        assertFalse(chk.isColdSweeperIdle());
        sweeper.setCooldown(false);
        assertTrue(chk.isColdSweeperIdle());
    }
}
