package executor;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Simulates fraudulent order book data to ensure it is ignored. */
public class FraudDetectionTest {
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
    void ignoresMismatchedBidAsk() {
        DummyRedisClient client = new DummyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        TriangularArbDetector detector = new TriangularArbDetector(exec);

        detector.update("A/B", 1.2, 1.1);  // bid >= ask -> invalid
        detector.update("B/C", 0.5, 0.6);
        detector.update("C/A", 4.2, 4.3);

        assertNull(exec.lastMessage, "Fraudulent feed should be ignored");
    }
}

