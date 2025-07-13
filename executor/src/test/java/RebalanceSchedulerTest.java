package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.Map;

@Tag("local")
public class RebalanceSchedulerTest {
    static class TestRebalancer extends Rebalancer {
        boolean called = false;
        Map<String, Double> lastBalances;
        double lastTarget;
        TestRebalancer() { super(0.0); }
        @Override
        public void rebalance(Map<String, Double> balances, double target) {
            called = true;
            lastBalances = balances;
            lastTarget = target;
        }
    }

    @Test
    void runOnceCollectsBalances() {
        Map<String, ExchangeAdapter> adapters = new HashMap<>();
        adapters.put("Binance", new MockExchangeAdapter("Binance") {
            @Override
            public double getBalance(String asset) { return 6000.0; }
        });
        adapters.put("Kraken", new MockExchangeAdapter("Kraken") {
            @Override
            public double getBalance(String asset) { return 4000.0; }
        });

        TestRebalancer rebalancer = new TestRebalancer();
        RebalanceScheduler scheduler = new RebalanceScheduler(rebalancer, adapters);
        scheduler.runOnce();

        assertTrue(rebalancer.called);
        assertEquals(2, rebalancer.lastBalances.size());
        assertEquals(5000.0, rebalancer.lastTarget, 0.001);
    }
}
