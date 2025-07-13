package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

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
}
