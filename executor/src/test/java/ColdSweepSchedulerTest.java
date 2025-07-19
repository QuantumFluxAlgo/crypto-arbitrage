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
        double lastAmount = 0.0;
        @Override
        public void withdraw(String address, double amountUsd) {
            called = true;
            lastAmount = amountUsd;
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
        assertEquals(10.0, wallet.lastAmount, 0.0001);
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
        assertEquals(10.0, wallet.lastAmount, 0.0001);
    }

    @Test
    void parsesIntervalProperty() {
        System.setProperty("SWEEP_INTERVAL_DAYS", "2");
        assertEquals(2, ColdSweepScheduler.getIntervalDays());
        System.clearProperty("SWEEP_INTERVAL_DAYS");
    }

    @Test
    void respectsSweepCadenceProperty() {
        System.setProperty("sweep_cadence", "Daily");
        TestWalletClient wallet = new TestWalletClient();
        ColdSweeper sweeper = new ColdSweeper(0, 0, wallet);
        ColdSweepScheduler scheduler = new ColdSweepScheduler(
                sweeper,
                () -> System.getProperty("sweep_cadence",
                        System.getenv().getOrDefault("sweep_cadence", "None")),
                () -> 5.0,
                () -> 5.0);
        scheduler.runOnce(LocalDate.of(2025,1,2));
        assertTrue(wallet.called);
        System.clearProperty("sweep_cadence");
    }
}
