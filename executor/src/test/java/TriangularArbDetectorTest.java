package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

/** Unit tests for {@link TriangularArbDetector}. */
@Tag("local")
public class TriangularArbDetectorTest {
    static class DummyRedisClient extends RedisClient {
        DummyRedisClient() { super("localhost", 6379, "chan", (c,m) -> {}); }
        @Override public void start() {}
    }

    static class DummyExecutor extends Executor {
        String lastMessage;
        DummyExecutor(DummyRedisClient client) {
            super(client, "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
        }
        @Override public void start() {}
        @Override public void handleMessage(String msg) { lastMessage = msg; }
    }

    @Test
    void detectsArbitrageLoop() {
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        TriangularArbDetector detector = new TriangularArbDetector(exec);

        detector.update("A/B", 0.5, 0.6);
        detector.update("B/C", 0.5, 0.6);
        detector.update("C/A", 4.2, 4.3);

        assertNotNull(exec.lastMessage);
        SpreadOpportunity opp = SpreadOpportunity.fromJson(exec.lastMessage);
        assertTrue(
            opp.getPair().equals("A-B-C") ||
            opp.getPair().equals("B-C-A") ||
            opp.getPair().equals("C-A-B"));
        assertEquals(0.05, opp.getNetEdge(), 1e-9);
    }

    @Test
    void ignoresNonProfitableLoop() {
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        TriangularArbDetector detector = new TriangularArbDetector(exec);

        detector.update("A/B", 1.0, 1.01);
        detector.update("B/C", 1.0, 1.01);
        detector.update("C/A", 0.99, 1.0);

        assertNull(exec.lastMessage);
    }
}

