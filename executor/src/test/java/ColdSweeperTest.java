package executor;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ColdSweeperTest {

    @Test
    void sweepsWhenProfitExceedsFixedThreshold() {
        ColdSweeper sweeper = new ColdSweeper();
        assertTrue(sweeper.shouldSweep(5000.0, 20000.0));
        assertTrue(sweeper.shouldSweep(6000.0, 1000.0));
    }

    @Test
    void sweepsWhenProfitExceedsPercentageOfCapital() {
        ColdSweeper sweeper = new ColdSweeper();
        assertTrue(sweeper.shouldSweep(4000.0, 10000.0)); // 40% of capital
        assertTrue(sweeper.shouldSweep(3000.0, 10000.0)); // exactly 30%
    }

    @Test
    void doesNotSweepWhenBelowThresholds() {
        ColdSweeper sweeper = new ColdSweeper();
        assertFalse(sweeper.shouldSweep(1000.0, 10000.0)); // only 10%
        assertFalse(sweeper.shouldSweep(4000.0, 20000.0)); // 20%
    }

    @Test
    void handlesZeroOrNegativeCapitalGracefully() {
        ColdSweeper sweeper = new ColdSweeper();
        assertTrue(sweeper.shouldSweep(6000.0, 0.0));  // absolute threshold met
        assertFalse(sweeper.shouldSweep(1000.0, -500.0)); // invalid capital
    }
}

