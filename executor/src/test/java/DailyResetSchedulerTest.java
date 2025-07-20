package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class DailyResetSchedulerTest {
    @Test
    void computesDelayWithinDay() {
        long secs = DailyResetScheduler.secondsUntilMidnight();
        assertTrue(secs > 0 && secs <= 24*60*60);
    }

    @Test
    void runOnceResetsDailyTotals() {
        ProfitTracker.init(1000, "http://localhost");
        ProfitTracker.record(-10.0);
        assertTrue(ProfitTracker.getDailyLossPct() > 0);
        DailyResetScheduler sched = new DailyResetScheduler();
        sched.runOnce();
        assertEquals(0.0, ProfitTracker.getDailyLossPct(), 1e-9);
        ProfitTracker.record(10.0); // restore global total for other tests
    }
}
