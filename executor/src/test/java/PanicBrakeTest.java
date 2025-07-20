package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;
import executor.PanicBrake;
import executor.ProfitTracker;

@Tag("local")
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

    @Test
    void readsThresholdsFromProperties() {
        System.setProperty("LOSS_CAP_PCT", "1.5");
        System.setProperty("LATENCY_MAX_MS", "200.0");
        System.setProperty("WIN_RATE_THRESHOLD", "0.9");
        try {
            assertTrue(PanicBrake.shouldHalt(2.0, 300.0, 0.5));
        } finally {
            System.clearProperty("LOSS_CAP_PCT");
            System.clearProperty("LATENCY_MAX_MS");
            System.clearProperty("WIN_RATE_THRESHOLD");
        }
    }

    @Test
    void triggersOnProfitTargetReached() {
        System.setProperty("PROFIT_TARGET_USD", "100.0");
        ProfitTracker.record(150.0);
        try {
            assertTrue(PanicBrake.shouldHalt(0.0, 100.0, 0.9));
        } finally {
            ProfitTracker.resetCumulativeProfit();
            System.clearProperty("PROFIT_TARGET_USD");
        }
    }
}
