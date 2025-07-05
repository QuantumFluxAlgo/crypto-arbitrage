import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import safety.PanicBrake;

public class PanicBrakeTest {
    @Test
    void triggersOnHighLoss() {
        assertTrue(PanicBrake.shouldHalt(4.0, 100.0, 0.8));
    }

    @Test
    void triggersOnHighLatency() {
        assertTrue(PanicBrake.shouldHalt(2.0, 800.0, 0.8));
    }

    @Test
    void triggersOnLowWinRate() {
        assertTrue(PanicBrake.shouldHalt(2.0, 100.0, 0.2));
    }

    @Test
    void passesIfAllWithinLimits() {
        assertFalse(PanicBrake.shouldHalt(1.0, 100.0, 0.8));
    }
}
