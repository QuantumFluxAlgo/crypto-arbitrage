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
    void placeOrderSucceedsRoughlyNinetyPercent() {
        MockExchangeAdapter adapter = new MockExchangeAdapter("Test");
        int success = 0;
        int total = 1000;
        for (int i = 0; i < total; i++) {
            if (adapter.placeOrder("BTC/USDT", "BUY", 1.0, 50000.0)) {
                success++;
            }
        }
        double ratio = success / (double) total;
        assertTrue(ratio > 0.85 && ratio < 0.95, "success ratio was " + ratio);
        
        @Test
        void transferDoesNotThrow() {
            ExchangeAdapter adapter = new MockExchangeAdapter("Test");
            assertDoesNotThrow(() -> adapter.transfer("USDT", 1.5, "wallet"));
        }
    }
}

