package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;
import executor.PanicBrake;
import executor.ProfitTracker;
import executor.RedisClient;
import executor.Config;
import executor.ExecutionMode;

@Tag("local")
public class PanicBrakeTest {
    static class DummyRedis extends RedisClient {
        String channel;
        String message;
        DummyRedis() { super("localhost", 6379, "chan", (c,m)->{}); }
        @Override public void start() {}
        @Override public void publish(String ch, String msg) { this.channel = ch; this.message = msg; }
    }

    @Test
    void triggersOnHighLoss() {
        assertTrue(PanicBrake.shouldHalt(null, new Config(ExecutionMode.LIVE), 4.0, 100.0, 0.8));
    }

    @Test
    void triggersOnHighLatency() {
        assertTrue(PanicBrake.shouldHalt(null, new Config(ExecutionMode.LIVE), 2.0, 800.0, 0.8));
    }

    @Test
    void triggersOnLowWinRate() {
        assertTrue(PanicBrake.shouldHalt(null, new Config(ExecutionMode.LIVE), 2.0, 100.0, 0.2));
    }

    @Test
    void passesIfAllWithinLimits() {
        assertFalse(PanicBrake.shouldHalt(null, new Config(ExecutionMode.LIVE), 1.0, 100.0, 0.8));
    }

    @Test
    void readsThresholdsFromProperties() {
        System.setProperty("LOSS_CAP_PCT", "1.5");
        System.setProperty("LATENCY_MAX_MS", "200.0");
        System.setProperty("WIN_RATE_THRESHOLD", "0.9");
        try {
            assertTrue(PanicBrake.shouldHalt(null, new Config(ExecutionMode.LIVE), 2.0, 300.0, 0.5));
        } finally {
            System.clearProperty("LOSS_CAP_PCT");
            System.clearProperty("LATENCY_MAX_MS");
            System.clearProperty("WIN_RATE_THRESHOLD");
        }
    }

    @Test
    void triggersOnProfitTargetReached() {
        System.setProperty("PROFIT_TARGET_USD", "100.0");
        ProfitTracker.record(150.0);
        try {
            assertTrue(PanicBrake.shouldHalt(null, new Config(ExecutionMode.LIVE), 0.0, 100.0, 0.9));
        } finally {
            ProfitTracker.resetCumulativeProfit();
            System.clearProperty("PROFIT_TARGET_USD");
        }
    }

    @Test
    void doesNotPublishPauseInDryRun() {
        DummyRedis redis = new DummyRedis();
        Config config = new Config(ExecutionMode.SANDBOX);
        assertTrue(PanicBrake.shouldHalt(redis, config, 4.0, 100.0, 0.8));
        assertNull(redis.channel);
        assertNull(redis.message);
    }
}
