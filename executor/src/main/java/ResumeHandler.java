public class ResumeHandler {
    private final Object redis;
    private final java.util.concurrent.Executor executor;
    private Thread thread;

    public ResumeHandler(Object redis, java.util.concurrent.Executor executor) {
        this.redis = redis;
        this.executor = executor;
    }

    public void start() {
        thread = new Thread(() -> {
            if (redis instanceof redis.clients.jedis.Jedis jedis) {
                jedis.subscribe(new redis.clients.jedis.JedisPubSub() {
                    @Override
                    public void onMessage(String channel, String message) {
                        if ("resume".equalsIgnoreCase(message) && executor instanceof ResumeCapable rc) {
                            System.out.println("RESUMING EXECUTION");
                            rc.resumeFromPanic();
                        }
                    }
                }, "control-feed");
            }
        });
        thread.start();
    }

    public interface ResumeCapable {
        void resumeFromPanic();
    }
}
