static class StubRedisClient {
    void subscribe(String channel, java.util.function.Consumer<String> handler) {
        handler.accept("resume");
    }
}

static class DummyExecutor extends executor.Executor {
    AtomicBoolean resumed = new AtomicBoolean(false);
    DummyExecutor() {
        super(new executor.RedisClient("localhost", 6379, "chan", (c,m)->{}), "localhost", 6379, new executor.RiskFilter(), new executor.NearMissLogger(null));
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
    Thread.sleep(50);
    assertTrue(exec.resumed.get());
}
}
