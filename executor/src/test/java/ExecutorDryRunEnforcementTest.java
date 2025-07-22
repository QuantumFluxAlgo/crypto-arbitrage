package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class ExecutorDryRunEnforcementTest {
    static class DummyRedisClient extends RedisClient {
        String channel;
        String message;
        boolean pingOk = false;
        DummyRedisClient(boolean pingOk) {
            super("localhost", 6379, "chan", (c,m)->{});
            this.pingOk = pingOk;
        }
        @Override public void start() {}
        @Override public boolean publish(String ch, String msg) { this.channel = ch; this.message = msg; return true; }
        @Override public boolean ping() { return pingOk; }
    }

    static class DummyExecutor extends Executor {
        DummyRedisClient client;
        DummyExecutor(DummyRedisClient c) {
            super(c, "localhost", 6379, new RiskFilter(), new NearMissLogger(null), new Config(ExecutionMode.LIVE));
            this.client = c;
        }
        @Override public void start() {}
    }

    @Test
    void blocksTradeWhenRedisDown() {
        ProfitTracker.init(10000, "http://localhost");
        DummyRedisClient client = new DummyRedisClient(false);
        DummyExecutor exec = new DummyExecutor(client);
        String msg = "{\"pair\":\"BTC/USDT\",\"buyExchange\":\"A\",\"sellExchange\":\"B\",\"grossEdge\":1.0,\"netEdge\":1.0}";
        exec.handleMessage(msg);
        assertNull(client.channel);
    }
}
