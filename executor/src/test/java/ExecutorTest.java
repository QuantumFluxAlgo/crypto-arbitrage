package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class ExecutorTest {
    static class DummyRedis extends RedisClient {
        java.util.function.Consumer<String> control;
        boolean paused = true;
        DummyRedis() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override public void start() {}
        @Override public boolean ping() { return true; }
        @Override public void subscribeControl(Config config, java.util.function.Consumer<String> handler) { control = handler; }
        @Override public boolean isPaused() { return paused; }
        void sendControl(String msg) { if (control != null) control.accept(msg); }
    }

    static class DummyWallet implements WalletClient {
        boolean called = false;
        @Override public void withdraw(String addr, double amountUsd) { called = true; }
    }

    static class DummyExecutor extends Executor {
        DummyRedis client;
        DummyExecutor(DummyRedis c) {
            super(c, "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.LIVE));
            this.client = c;
        }
        @Override public void start() { setupControlSubscription(); }
    }

    @Test
    void skipsEvaluationWhenPaused() {
        ProfitTracker.init(10000, "http://localhost");
        DummyRedis redis = new DummyRedis();
        DummyExecutor exec = new DummyExecutor(redis);
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        try {
            exec.handleMessage("{\"pair\":\"A/B\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":1.0,\"netEdge\":1.0}");
        } finally {
            System.setErr(orig);
        }
        String out = err.toString();
        assertTrue(out.contains("[EXECUTOR PAUSED] Skipping trade evaluation"));
    }

    @Test
    void logsResumeMessage() {
        DummyRedis redis = new DummyRedis();
        DummyExecutor exec = new DummyExecutor(redis);
        exec.start();
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        try {
            redis.sendControl("resume");
        } finally {
            System.setErr(orig);
        }
        assertTrue(err.toString().contains("[RESUME SIGNAL RECEIVED] Resuming trade evaluation"));
    }

    @Test
    void dryRunSweepLogsMessage() {
        DummyWallet wallet = new DummyWallet();
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        try {
            ColdSweeper sweeper = new ColdSweeper(0, 0, wallet, new ColdSweeperConfig(), null, new Config(ExecutionMode.DRY_RUN));
            sweeper.sweepToColdWallet(10.0);
        } finally {
            System.setErr(orig);
        }
        String out = err.toString();
        assertTrue(out.contains("[DRY-RUN MODE] Cold wallet sweep logic verified. No assets moved."));
        assertFalse(wallet.called);
    }
}
