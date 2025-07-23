package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/** Ensure metrics updates are thread-safe when accessed concurrently. */
@Tag("local")
public class ExecutorMetricsTest {
    static class DummyRedisClient extends RedisClient {
        DummyRedisClient() { super("localhost", 6379, "chan", (c,m) -> {}); }
        @Override public void start() {}
        @Override public boolean ping() { return true; }
        @Override public boolean publish(String c, String m) { return true; }
    }

    static class ExposedExecutor extends Executor {
        ExposedExecutor() {
            super(new DummyRedisClient(), "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
        }
        @Override public void start() {}
        void applyMetric(TradeResult r) throws Exception {
            java.lang.reflect.Method m = Executor.class.getDeclaredMethod("updatePerformanceMetrics", TradeResult.class);
            m.setAccessible(true);
            m.invoke(this, r);
        }
    }

    @Test
    void metricsConsistentWithParallelUpdates() throws Exception {
        ExposedExecutor exec = new ExposedExecutor();
        int threads = 4;
        int tradesPerThread = 30;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                for (int j = 0; j < tradesPerThread; j++) {
                    try {
                        exec.applyMetric(new TradeResult(true, 1.0, 5));
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }
            });
        }
        pool.shutdown();
        assertTrue(pool.awaitTermination(5, TimeUnit.SECONDS));

        MetricsSnapshot snap = exec.getMetrics();
        int expected = threads * tradesPerThread;
        assertEquals(expected, snap.tradeCount);
        assertEquals(expected, snap.winCount);
        assertEquals(expected * 5L, snap.totalLatencyMs);
        assertEquals((double) (expected * 5L) / expected, snap.averageLatencyMs, 1e-9);
    }
}
