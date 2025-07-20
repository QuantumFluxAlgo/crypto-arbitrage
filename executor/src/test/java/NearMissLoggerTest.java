package executor;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class NearMissLoggerTest {
    @Test
    void logDoesNothingWhenConnectionNull() {
        NearMissLogger logger = new NearMissLogger(null);
        SpreadOpportunity opp = new SpreadOpportunity("BTC/USDT", "A", "B", 1.0, 1.0, 0L);
        assertDoesNotThrow(() -> logger.log(opp, "test"));
    }
}
