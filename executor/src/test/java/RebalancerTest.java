package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

import java.util.HashMap;
import java.util.Map;

@Tag("local")
public class RebalancerTest {
    @Test
    void handlesImbalancedExchanges() {
        Map<String, Double> balances = new HashMap<>();
        balances.put("Binance", 6000.0);  // high
        balances.put("Kraken",  4000.0);  // low
        balances.put("Coinbase", 5000.0); // normal

        Rebalancer rebalancer = new Rebalancer(250.0);
        assertDoesNotThrow(() -> rebalancer.rebalance(balances, 5000.0));
    }

    static class DummyAdapter implements ExchangeAdapter {
        boolean called = false;
        @Override public boolean placeOrder(String pair, String side, double size, double limitPrice) { return true; }
        @Override public double getFeeRate(String pair) { return 0; }
        @Override public double getBalance(String asset) { return 0; }
        @Override public void transfer(String asset, double amount, String destination) { called = true; }
    }

    @Test
    void dryRunSkipsTransfer() {
        Map<String, Double> balances = new HashMap<>();
        balances.put("Binance", 6000.0);
        DummyAdapter adapter = new DummyAdapter();
        Map<String, ExchangeAdapter> adapters = new HashMap<>();
        adapters.put("Binance", adapter);
        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        try {
            Rebalancer r = new Rebalancer(250.0, adapters, new Config(ExecutionMode.SANDBOX));
            r.scan(balances, 5000.0);
        } finally {
            System.setErr(orig);
        }
        assertFalse(adapter.called);
        assertTrue(err.toString().contains("[DRY-RUN]"));
    }

    @Test
    void liveModeTransfers() {
        Map<String, Double> balances = new HashMap<>();
        balances.put("Binance", 6000.0);
        DummyAdapter adapter = new DummyAdapter();
        Map<String, ExchangeAdapter> adapters = new HashMap<>();
        adapters.put("Binance", adapter);
        Rebalancer r = new Rebalancer(250.0, adapters, new Config(ExecutionMode.LIVE));
        r.scan(balances, 5000.0);
        assertTrue(adapter.called);
    }
}
