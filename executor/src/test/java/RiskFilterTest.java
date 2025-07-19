package executor;


import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class RiskFilterTest {
    @Test
    void rejectsWhenEdgeBelowThreshold() {
        RiskFilter filter = new RiskFilter(2.0, 100);
        Spread spread = new Spread(1.5, 50);
        assertFalse(filter.accept(spread), "Spread with low edge should be rejected");
    }

    @Test
    void rejectsWhenLatencyAboveThreshold() {
        RiskFilter filter = new RiskFilter(2.0, 100);
        Spread spread = new Spread(2.5, 150);
        assertFalse(filter.accept(spread), "Spread with high latency should be rejected");
    }

    @Test
    void acceptsValidSpreads() {
        RiskFilter filter = new RiskFilter(2.0, 100);
        Spread spread = new Spread(3.0, 80);
        assertTrue(filter.accept(spread), "Valid spread should be accepted");
    }

    @Test
    void rejectsInvalidNetEdge() {
        RiskFilter filter = new RiskFilter(0.0, 100);
        SpreadOpportunity bad1 = new SpreadOpportunity("BTC/USDT", "A", "B", 1.0, Double.NaN, 0L);
        SpreadOpportunity bad2 = new SpreadOpportunity("BTC/USDT", "A", "B", 1.0, -0.5, 0L);
        assertFalse(filter.passes(bad1));
        assertFalse(filter.passes(bad2));
    }
}
