package executor;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

// For using ExchangeAdapter interface in tests
import executor.ExchangeAdapter;

public class MockExchangeAdapterTest {
    @Test
    void feeRateIsConstant() {
        MockExchangeAdapter adapter = new MockExchangeAdapter("Test");
        assertEquals(0.001, adapter.getFeeRate("BTC/USDT"), 1e-9);
    }

    @Test
    void balanceAlwaysTenThousand() {
        MockExchangeAdapter adapter = new MockExchangeAdapter("Test");
        assertEquals(10000.0, adapter.getBalance("BTC"), 1e-9);
    }

    @Test
    void placeOrderSucceedsRoughlyEightyPercent() {
        MockExchangeAdapter adapter = new MockExchangeAdapter("Test");
        int success = 0;
        int total = 1000;
        for (int i = 0; i < total; i++) {
            if (adapter.placeOrder("BTC/USDT", "BUY", 1.0, 50000.0)) {
                success++;
            }
        }
        double ratio = success / (double) total;
        assertTrue(ratio > 0.75 && ratio < 0.85, "success ratio was " + ratio);
    }

    @Test
    void partialFillSetsFeeAndSize() {
        MockExchangeAdapter adapter = new MockExchangeAdapter("Test");
        boolean observed = false;
        for (int i = 0; i < 1000 && !observed; i++) {
            boolean filled = adapter.placeOrder("BTC/USDT", "BUY", 1.0, 50000.0);
            if (!filled && adapter.getLastFillSize() > 0) {
                observed = true;
                double expectedFee = (1.0 - adapter.getLastFillSize()) * 50000.0 * adapter.getCancelFeeRate();
                assertEquals(expectedFee, adapter.getLastCancelFee(), 1e-9);
            }
        }
        assertTrue(observed, "no partial fill encountered");
    }

    @Test
    void transferDoesNotThrow() {
        ExchangeAdapter adapter = new MockExchangeAdapter("Test");
        assertDoesNotThrow(() -> adapter.transfer("USDT", 1.5, "wallet"));
    }
}

