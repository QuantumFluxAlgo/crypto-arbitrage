package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

@Tag("local")
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

    static class TestWalletClient implements WalletClient {
        boolean called = false;
        @Override
        public void withdraw(String address, double amountUsd) { called = true; }
    }

    @Test
    void dryRunSkipsWithdrawal() {
        TestWalletClient wallet = new TestWalletClient();
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        try {
            ColdSweeper sweeper = new ColdSweeper(0, 0, wallet, new ColdSweeperConfig(), null, new Config(ExecutionMode.SANDBOX));
            sweeper.sweepToColdWallet(10.0);
        } finally {
            System.setErr(orig);
        }
        assertFalse(wallet.called);
        String out = err.toString();
        assertTrue(out.contains("\"event\":\"cold_wallet_sweep\""));
    }

    @Test
    void liveModeWithdraws() {
        TestWalletClient wallet = new TestWalletClient();
        ColdSweeper sweeper = new ColdSweeper(0, 0, wallet, new ColdSweeperConfig(), null, new Config(ExecutionMode.LIVE));
        sweeper.sweepToColdWallet(10.0);
        assertTrue(wallet.called);
    }
}

