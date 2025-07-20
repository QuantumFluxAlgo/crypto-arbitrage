package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class ConfigValidatorTest {

    @Test
    public void testValidConfigPasses() {
        ConfigValidator validator = new ConfigValidator(5.0, 300.0, 0.5, 1.0, 0.0);
        assertDoesNotThrow(validator::validate);
    }

    @Test
    public void testLossCapTooHighFails() {
        ConfigValidator validator = new ConfigValidator(15.0, 300.0, 0.5, 1.0, 0.0);
        RuntimeException e = assertThrows(RuntimeException.class, validator::validate);
        assertTrue(e.getMessage().contains("LOSS_CAP_PCT exceeds safe limit"));
    }

    @Test
    public void testLatencyTooHighFails() {
        ConfigValidator validator = new ConfigValidator(5.0, 800.0, 0.5, 1.0, 0.0);
        RuntimeException e = assertThrows(RuntimeException.class, validator::validate);
        assertTrue(e.getMessage().contains("LATENCY_MAX_MS exceeds safe limit"));
    }

    @Test
    public void testWinRateTooLowFails() {
        ConfigValidator validator = new ConfigValidator(5.0, 300.0, 0.2, 1.0, 0.0);
        RuntimeException e = assertThrows(RuntimeException.class, validator::validate);
        assertTrue(e.getMessage().contains("WIN_RATE_THRESHOLD is too low"));
    }

    @Test
    public void testSlippageTooHighFails() {
        ConfigValidator validator = new ConfigValidator(5.0, 300.0, 0.5, 10.0, 0.0);
        RuntimeException e = assertThrows(RuntimeException.class, validator::validate);
        assertTrue(e.getMessage().contains("MAX_SLIPPAGE_PCT exceeds safe limit"));
    }

    @Test
    public void testProfitTargetTooHighFails() {
        ConfigValidator validator = new ConfigValidator(5.0, 300.0, 0.5, 1.0, 30000.0);
        RuntimeException e = assertThrows(RuntimeException.class, validator::validate);
        assertTrue(e.getMessage().contains("PROFIT_TARGET_USD exceeds safe limit"));
    }
}
