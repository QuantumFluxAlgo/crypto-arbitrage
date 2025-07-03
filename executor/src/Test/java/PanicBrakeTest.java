import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import safety.PanicBrake;

public class PanicBrakeTest {
    @Test
    void triggersOnHighLoss() {
        assertTrue(PanicBrake.shouldHalt(4.0f, 100f, 0.8f));
    }

    @Test
    void triggersOnHighLatency() {
        assertTrue(PanicBrake.shouldHalt(2.0f, 800f, 0.8f));
    }

    @Test
    void triggersOnLowWinRate() {
        assertTrue(PanicBrake.shouldHalt(2.0f, 100f, 0.2f));
    }

    @Test
    void passesIfAllWithinLimits() {
        assertFalse(PanicBrake.shouldHalt(1.0f, 100f, 0.8f));
    }
}
