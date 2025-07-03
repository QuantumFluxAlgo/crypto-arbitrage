import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class MockExchangeAdapterTest {
    @Test
    void feeRateIsConstant() {
        MockExchangeAdapter adapter = new MockExchangeAdapter();
        assertEquals(0.001, adapter.getFeeRate(), 1e-9);
    }

    @Test
    void balanceAlwaysTenThousand() {
        MockExchangeAdapter adapter = new MockExchangeAdapter();
        assertEquals(10000.0, adapter.getBalance("BTC"), 1e-9);
    }

    @Test
    void placeOrderSucceedsRoughlyNinetyPercent() {
        MockExchangeAdapter adapter = new MockExchangeAdapter();
        int success = 0;
        int total = 1000;
        for (int i = 0; i < total; i++) {
            if (adapter.placeOrder("BTC/USDT", 1.0, 50000.0, true)) {
                success++;
            }
        }
        double ratio = success / (double) total;
        assertTrue(ratio > 0.85 && ratio < 0.95, "success ratio was " + ratio);
    }
}
