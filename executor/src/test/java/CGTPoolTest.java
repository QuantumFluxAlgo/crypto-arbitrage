package executor;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;

@Tag("local")
public class CGTPoolTest {
    @Test
    void calculatesAverageCost() {
        CGTPool pool = new CGTPool(null);
        pool.recordBuy("BTC", 2.0, 10000.0);
        double gain = pool.recordSell("BTC", 1.0, 11000.0);
        CGTPool.PoolEntry entry = pool.getEntry("BTC");
        assertEquals(1.0, entry.quantity, 1e-6);
        assertEquals(10000.0, entry.cost, 1e-6);
        assertEquals(1000.0, gain, 1e-6);
    }
}
