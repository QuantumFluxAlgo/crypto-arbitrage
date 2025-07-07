package executor;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ConfigValidatorTest {

    @Test
    public void testValidConfigPasses() {
        ConfigValidator validator = new ConfigValidator(5.0, 300.0, 0.5);
        assertDoesNotThrow(validator::validate);
    }

    @Test
    public void testLossCapTooHighFails() {
        ConfigValidator validator = new ConfigValidator(15.0, 300.0, 0.5);
        RuntimeException e = assertThrows(RuntimeException.class, validator::validate);
        assertTrue(e.getMessage().contains("LOSS_CAP_PCT exceeds safe limit"));
    }

    @Test
    public void testLatencyTooHighFails() {
        ConfigValidator validator = new ConfigValidator(5.0, 800.0, 0.5);
        RuntimeException e = assertThrows(RuntimeException.class, validator::validate);
        assertTrue(e.getMessage().contains("LATENCY_MAX_MS exceeds safe limit"));
    }

    @Test
    public void testWinRateTooLowFails() {
        ConfigValidator validator = new ConfigValidator(5.0, 300.0, 0.2);
        RuntimeException e = assertThrows(RuntimeException.class, validator::validate);
        assertTrue(e.getMessage().contains("WIN_RATE_THRESHOLD is too low"));
    }
}

