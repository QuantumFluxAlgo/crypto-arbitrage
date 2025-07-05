package executor;

import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for {@link ResumeHandler}.
 */
public class ResumeHandlerTest {

    /** Simple stub of the Redis client that immediately sends a resume message. */
    static class StubRedisClient extends RedisClient {
        StubRedisClient() {
            super("localhost", 6379, "chan", (c, m) -> {});
        }

        @Override
        public void subscribe(redis.clients.jedis.JedisPubSub listener, String... channels) {
            listener.onMessage(channels[0], "resume");        }
    }

    /**
     * Minimal {@link Executor} implementation that records whether resumeFromPanic was invoked.
     */
    static class DummyExecutor extends executor.Executor {
        final AtomicBoolean resumed = new AtomicBoolean(false);

        DummyExecutor() {
            super(new executor.RedisClient("localhost", 6379, "chan", (c, m) -> {}),
                    "localhost", 6379, new executor.RiskFilter(), new executor.NearMissLogger(null));
        }

        @Override
        public void resumeFromPanic() {
            resumed.set(true);
        }
    }

    @Test
    void invokesResumeOnMessage() throws Exception {
        DummyExecutor exec = new DummyExecutor();
        ResumeHandler handler = new ResumeHandler(new StubRedisClient(), exec);
        handler.start();
        // Wait briefly to allow the handler thread to process the message
        Thread.sleep(50);
        assertTrue(exec.resumed.get());
    }
}
