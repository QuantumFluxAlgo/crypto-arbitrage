package executor;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/** Ensures Executor continues processing after Redis reconnects. */
public class ExecutorRedisRecoveryTest {
    /** Redis client stub emitting a message, a disconnect, then another message. */
    static class FlakyRedisClient extends RedisClient {
        MessageHandler handler;
        FlakyRedisClient() {
            super("localhost", 6379, "chan", (c, m) -> {});
        }
        void setHandler(MessageHandler h) { this.handler = h; }
        @Override public void start() { run(); }
        @Override public void run() {
            if (handler == null) return;
            handler.onMessage("chan", "{\"pair\":\"A/B\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":1.0,\"netEdge\":1.0}");
            handler.onMessage("chan", "{}"); // disconnect signal
            handler.onMessage("chan", "{\"pair\":\"C/D\",\"buyExchange\":\"C\",\"sellExchange\":\"D\",\"grossEdge\":1.0,\"netEdge\":1.0}");
        }
    }

    /** Executor capturing handled messages. */
    static class DummyExecutor extends Executor {
        int count = 0;
        DummyExecutor(FlakyRedisClient client) {
            super(client, "localhost", 6379, new RiskFilter(), new NearMissLogger(null));
        }
        @Override public void start() {}
        @Override public void handleMessage(String msg) {
            if (msg == null || msg.trim().isEmpty() || msg.equals("{}")) return;
            count++;
        }
    }

    @Test
    void processesMessagesAfterReconnect() {
        FlakyRedisClient client = new FlakyRedisClient();
        DummyExecutor exec = new DummyExecutor(client);
        client.setHandler((c, m) -> exec.handleMessage(m));
        client.start();
        assertEquals(2, exec.count);
    }
}
