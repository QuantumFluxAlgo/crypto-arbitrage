import executor.Executor;

/**
 * Skeleton for a handler that listens for resume signals over Redis.
 */
public class ResumeHandler {
    
    /** Connection to Redis. */
    private final Object redis;

    /** Reference to the main executor. */
    private final Executor executor;

    /** Internal thread for listening to resume events. */
    private Thread thread;

    /**
     * Create a new resume handler.
     *
     * @param redis     active Redis connection
     * @param executor  executor to resume when signalled
     */
    public ResumeHandler(Object redis, Executor executor) {        this.redis = redis;
        this.executor = executor;
    }

    
    /**
     * Start the listener in its own thread.
     */
    public void start() {
        thread = new Thread(() -> {
            // TODO: subscribe to Redis and trigger executor.resumeFromPanic()
        });
        thread.start();
    }
}
