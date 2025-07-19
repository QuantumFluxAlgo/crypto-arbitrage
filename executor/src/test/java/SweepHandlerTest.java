package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class SweepHandlerTest {

    /** Redis stub that immediately emits a sweep message. */
    static class StubRedisClient extends RedisClient {
        StubRedisClient() {
            super("localhost", 6379, "chan", (c, m) -> {}, 1L, 2L);
        }

        @Override
        public void subscribe(redis.clients.jedis.JedisPubSub listener, String... channels) {
            listener.onMessage(channels[0], "sweep");
        }
    }

    /** Wallet stub capturing withdrawal requests. */
    static class CaptureWallet implements WalletClient {
        boolean called = false;
        double amount = 0.0;

        @Override
        public void withdraw(String address, double amountUsd) {
            if (!called) {
                called = true;
                amount = amountUsd;
            }
        }
    }

    @Test
    void invokesSweepOnMessage() throws Exception {
        CaptureWallet wallet = new CaptureWallet();
        ColdSweeper sweeper = new ColdSweeper(0, 0, wallet);
        ProfitTracker.resetCumulativeProfit();
        ProfitTracker.record(12.0);
        SweepHandler handler = new SweepHandler(new StubRedisClient(), sweeper, 1L, 2L);
        handler.start();
        Thread.sleep(50);  // allow handler thread to process
        assertTrue(wallet.called);
        assertEquals(12.0, wallet.amount, 0.0001);
    }
}
