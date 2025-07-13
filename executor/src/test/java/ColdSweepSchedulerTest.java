package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicBoolean;

@Tag("local")
public class ColdSweepSchedulerTest {
    static class TestWalletClient implements WalletClient {
        boolean called = false;
        @Override
        public void withdraw(String address) {
            called = true;
        }
    }

    @Test
    void noSweepWhenCadenceNone() {
        TestWalletClient wallet = new TestWalletClient();
        ColdSweeper sweeper = new ColdSweeper(0, 0, wallet);
        ColdSweepScheduler scheduler = new ColdSweepScheduler(
                sweeper,
                () -> "None",
                () -> 10.0,
                () -> 10.0);
        scheduler.runOnce(LocalDate.of(2025,1,1));
        assertFalse(wallet.called);
    }

    @Test
    void dailySweepTriggersWhenThresholdMet() {
        TestWalletClient wallet = new TestWalletClient();
        ColdSweeper sweeper = new ColdSweeper(0, 0, wallet);
        ColdSweepScheduler scheduler = new ColdSweepScheduler(
                sweeper,
                () -> "Daily",
                () -> 10.0,
                () -> 10.0);
        scheduler.runOnce(LocalDate.of(2025,1,2));
        assertTrue(wallet.called);
    }

    @Test
    void monthlySweepOnlyOnFirstDay() {
        TestWalletClient wallet = new TestWalletClient();
        ColdSweeper sweeper = new ColdSweeper(0, 0, wallet);
        ColdSweepScheduler scheduler = new ColdSweepScheduler(
                sweeper,
                () -> "Monthly",
                () -> 10.0,
                () -> 10.0);
        scheduler.runOnce(LocalDate.of(2025,1,2));
        assertFalse(wallet.called);
        scheduler.runOnce(LocalDate.of(2025,1,1));
        assertTrue(wallet.called);
    }
}
