import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ColdSweeperTest {
    @Test
    void profitGreaterThanFiveThousandTriggersSweep() {
        ColdSweeper sweeper = new ColdSweeper(10000);
        assertTrue(sweeper.shouldSweep(6000));
    }

    @Test
    void profitThirtyPercentOfCapitalTriggersSweep() {
        ColdSweeper sweeper = new ColdSweeper(10000);
        assertTrue(sweeper.shouldSweep(3000));
    }

    @Test
    void lowProfitDoesNotTriggerSweep() {
        ColdSweeper sweeper = new ColdSweeper(20000);
        assertFalse(sweeper.shouldSweep(1000));
    }
}

