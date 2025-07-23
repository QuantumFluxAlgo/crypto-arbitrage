package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class SlippageCheckerTest {

    @Test
    void tradeRejectedWhenSlippageTooHigh() {
        System.setProperty("MAX_SLIPPAGE_PCT", "0.2");
        SpreadOpportunity opp = new SpreadOpportunity("BTC/USDT", "A", "B", 2.0, 1.0, 0L);
        TradeResult result = opp.execute(1.0, 100.0);
        assertFalse(result.success);
        assertEquals("SLIPPAGE_BREACH", result.status);
    }

    @Test
    void tradePassesWithinSlippageLimit() {
        System.setProperty("MAX_SLIPPAGE_PCT", "0.2");
        SpreadOpportunity opp = new SpreadOpportunity("BTC/USDT", "A", "B", 2.0, 1.998, 0L);
        TradeResult result = opp.execute(1.0, 100.0);
        assertTrue(result.success);
        assertEquals("FILLED", result.status);
    }
}
