package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.lang.reflect.Field;
import java.util.Map;
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

    static class CountingExecutor extends DummyExecutor {
        int count = 0;
        CountingExecutor(DummyRedisClient c) { super(c); }
        @Override public void handleMessage(String msg) { count++; super.handleMessage(msg); }
    }

    @Test
    void detectsArbitrageLoop() {
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        TriangularArbDetector detector = new TriangularArbDetector(exec, 0);

        detector.update("A/B", 0.5, 0.6);
        detector.update("B/C", 0.5, 0.6);
        detector.update("C/A", 4.2, 4.3);

        assertNotNull(exec.lastMessage);
        SpreadOpportunity opp = SpreadOpportunity.fromJson(exec.lastMessage);
        assertTrue(
            opp.getPair().equals("A-B-C") ||
            opp.getPair().equals("B-C-A") ||
            opp.getPair().equals("C-A-B"));
        assertEquals(2.4865104965, opp.getNetEdge(), 1e-9);
    }

    @Test
    void ignoresNonProfitableLoop() {
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        TriangularArbDetector detector = new TriangularArbDetector(exec, 0);

        detector.update("A/B", 1.0, 1.01);
        detector.update("B/C", 1.0, 1.01);
        detector.update("C/A", 0.99, 1.0);

        assertNull(exec.lastMessage);
    }

    @Test
    void selectsHighestNetEdge() {
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        TriangularArbDetector detector = new TriangularArbDetector(exec, 0);

        detector.update("A/B", 0.5, 0.6);
        detector.update("B/C", 0.5, 0.6);
        detector.update("C/A", 4.2, 4.3);
        detector.update("B/D", 0.5, 0.6);
        detector.update("D/A", 2.0, 2.1);

        assertNotNull(exec.lastMessage);
        SpreadOpportunity opp = SpreadOpportunity.fromJson(exec.lastMessage);
        assertEquals("A-B-C", opp.getPair());
    }

    @Test
    void throttlesScanFrequency() throws Exception {
        DummyRedisClient client = new DummyRedisClient();
        CountingExecutor exec = new CountingExecutor(client);
        TriangularArbDetector detector = new TriangularArbDetector(exec, 50);

        detector.update("A/B", 0.5, 0.6);
        detector.update("B/C", 0.5, 0.6);
        detector.update("C/A", 4.2, 4.3);
        detector.update("A/B", 0.6, 0.7);

        Thread.sleep(80);
        detector.stop();
        assertEquals(1, exec.count);
    }

    @Test
    void removesPairsAfterTtlExpiration() throws Exception {
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);

        class MockDetector extends TriangularArbDetector {
            long time = 0;
            MockDetector(Executor e) { super(e, 0, 100); }
            @Override protected long now() { return time; }
        }

        MockDetector detector = new MockDetector(exec);
        Field booksField = TriangularArbDetector.class.getDeclaredField("books");
        booksField.setAccessible(true);
        Field lastSeenField = TriangularArbDetector.class.getDeclaredField("lastSeen");
        lastSeenField.setAccessible(true);

        ByteArrayOutputStream err = new ByteArrayOutputStream();
        PrintStream orig = System.err;
        System.setErr(new PrintStream(err));
        try {
            detector.time = 0;
            detector.update("A/B", 1.0, 1.1);
            detector.update("B/C", 1.0, 1.1);
            detector.update("C/D", 1.0, 1.1);

            Map<?,?> books = (Map<?,?>) booksField.get(detector);
            assertEquals(3, books.size());

            detector.time = 150;
            detector.update("D/E", 1.0, 1.1);

            books = (Map<?,?>) booksField.get(detector);
            Map<?,?> lastSeen = (Map<?,?>) lastSeenField.get(detector);
            assertEquals(1, books.size());
            assertEquals(1, lastSeen.size());
        } finally {
            System.setErr(orig);
        }

        String logs = err.toString();
        assertTrue(logs.contains("[TTL-CLEANUP] Removing inactive pair: A/B"));
        assertTrue(logs.contains("[TTL-CLEANUP] Removing inactive pair: B/C"));
        assertTrue(logs.contains("[TTL-CLEANUP] Removing inactive pair: C/D"));
    }
}

