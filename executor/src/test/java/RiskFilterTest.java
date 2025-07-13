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
}
