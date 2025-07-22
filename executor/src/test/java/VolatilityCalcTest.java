package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class VolatilityCalcTest {
    static class DummyRedisClient extends RedisClient {
        DummyRedisClient() { super("localhost", 6379, "chan", (c,m) -> {}); }
        @Override public void start() {}
        @Override public boolean ping() { return true; }
    }

    static class DummyExecutor extends Executor {
        DummyExecutor() {
            super(new DummyRedisClient(), "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
        }
        @Override public void start() {}
    }

    @Test
    void computesVolatilityFromPrices() {
        DummyExecutor exec = new DummyExecutor();
        double[] prices = {100, 102, 101, 99, 100};
        for (double p : prices) {
            exec.recordMidPrice(p);
        }
        double mean = java.util.Arrays.stream(prices).average().orElse(0.0);
        double var = 0.0;
        for (double p : prices) {
            var += (p - mean) * (p - mean);
        }
        var /= prices.length;
        double expected = Math.sqrt(var);
        assertEquals(expected, exec.getVolatility(), 1e-9);
    }
}

