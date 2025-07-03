import executor.Executor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ResumeHandler {
    private static final String CHANNEL = "control-feed";
     private static final Logger logger = LoggerFactory.getLogger(ResumeHandler.class);

    private final Object redis;
     private final Executor executor;
     private Thread thread;

     public ResumeHandler(Object redis, Executor executor) {
         this.redis = redis;
         this.executor = executor;
     }

     public void start() {
         thread = new Thread(() -> {
             if (redis instanceof redis.clients.jedis.Jedis jedis) {
                 jedis.subscribe(new redis.clients.jedis.JedisPubSub() {
                     @Override
                     public void onMessage(String channel, String message) {
                         if ("resume".equalsIgnoreCase(message)) {
                             logger.info("RESUMING EXECUTION");
                             executor.resumeFromPanic();
                         }
                     }
                 }, CHANNEL);
             } else if (redis instanceof RedisClient client) {
                 client.subscribe(CHANNEL, message -> {
                     if ("resume".equalsIgnoreCase(message)) {
                         logger.info("RESUMING EXECUTION");
                         executor.resumeFromPanic();
                     }
                 });
             }
         });
         thread.start();
     }
