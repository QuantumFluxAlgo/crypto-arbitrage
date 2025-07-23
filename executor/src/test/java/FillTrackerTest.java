package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import java.util.Random;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class FillTrackerTest {
    static class FixedRandom extends Random {
        private final double[] values;
        private int idx = 0;
        FixedRandom(double... v) { this.values = v; }
        @Override
        public double nextDouble() {
            return values[idx < values.length ? idx++ : values.length - 1];
        }
    }

    @Test
    void fullFill() {
        MockExchangeAdapter adapter = new MockExchangeAdapter("A", 0.0002, new FixedRandom(0.5));
        FillTracker tracker = new FillTracker(100);
        String id = tracker.submitOrder(adapter, "BTC/USDT", "BUY", 1.0, 100.0);
        assertTrue(tracker.waitForFill(id));
        assertTrue(adapter.getCanceledOrders().isEmpty());
    }

    @Test
    void partialThenCancel() {
        MockExchangeAdapter adapter = new MockExchangeAdapter("A", 0.0002, new FixedRandom(0.85));
        FillTracker tracker = new FillTracker(50);
        String id = tracker.submitOrder(adapter, "BTC/USDT", "BUY", 1.0, 100.0);
        assertFalse(tracker.waitForFill(id));
        assertEquals(1, adapter.getCanceledOrders().size());
    }

    @Test
    void timeoutCancel() {
        MockExchangeAdapter adapter = new MockExchangeAdapter("A", 0.0002, new FixedRandom(0.95));
        FillTracker tracker = new FillTracker(50);
        String id = tracker.submitOrder(adapter, "BTC/USDT", "BUY", 1.0, 100.0);
        assertFalse(tracker.waitForFill(id));
        assertEquals(1, adapter.getCanceledOrders().size());
    }
}
