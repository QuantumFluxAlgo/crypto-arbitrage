package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class SpreadOpportunityTest {
    @Test
    void subtractsFeesFromBothSides() {
        MockExchangeAdapter.setFeeRate("A", 0.001);
        MockExchangeAdapter.setFeeRate("B", 0.001);
        SpreadOpportunity opp = new SpreadOpportunity("BTC/USDT", "A", "B", 2.0, 2.0, 0L);
        TradeResult result = opp.execute(1.0, 100.0);
        double expected = 2.0 - (1.0 * 100.0 * 0.001) - (1.0 * 100.0 * 0.001);
        if (result.success) {
            assertEquals(expected, result.pnl, 1e-9);
        } else {
            assertEquals(0.0, result.pnl, 1e-9);
        }
    }
}
