package executor;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Verifies trade size respects order book depth limit. */
public class RiskSettingsTest {
    @Test
    void tradeSizeCappedByOrderBookDepth() {
        ProfitTracker.init(10000, "http://localhost");
        RiskSettings settings = new RiskSettings(10000, 20.0, 500.0);
        double size = settings.computeTradeSize();
        assertEquals(500.0, size, 1e-9);
    }
}
