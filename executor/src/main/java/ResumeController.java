package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Handles resume requests with safety checks.
 */
public class ResumeController {
    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    private final Executor executor;
    private final SystemHealthChecker checker;
    private final RedisClient redis;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Path resumeLog;

    private void logAttempt(String event, String detail) {
        try {
            String entry = mapper.writeValueAsString(java.util.Map.of(
                    "timestamp", java.time.Instant.now().toString(),
                    "event", event,
                    "detail", detail));
            Files.createDirectories(resumeLog.getParent());
            Files.writeString(resumeLog, entry + System.lineSeparator(),
                    java.nio.file.StandardOpenOption.CREATE,
                    java.nio.file.StandardOpenOption.APPEND);
        } catch (Exception e) {
            logger.error("Failed to write resume log", e);
        }
    }

    /** Simple container for HTTP-like responses. */
    public static class Response {
        public final int status;
        public final String body;
        Response(int status, String body) {
            this.status = status;
            this.body = body;
        }
    }

    public ResumeController(Executor executor, SystemHealthChecker checker, RedisClient redis) {
        this.executor = executor;
        this.checker = checker == null ? new SystemHealthChecker() : checker;
        this.redis = redis;
        String dir = System.getenv().getOrDefault("LOG_DIR", "/var/log/prism-arbitrage");
        this.resumeLog = java.nio.file.Paths.get(dir, "resume.log");
    }

    /**
     * Process a resume request.
     *
     * @return response containing status code and JSON body
     */
    public Response resume() {
        String reason = null;
        if (!checker.isHeartbeatAlive()) {
            reason = "heartbeat";
        } else if (!checker.isColdSweeperIdle()) {
            reason = "sweeper";
        } else if (!checker.isPanicStateCleared()) {
            reason = "panicFlag";
        }

        if (reason != null) {
            logger.error("[RESUME-BLOCKED] System not safe to resume: {}", reason);
            try {
                String body = mapper.writeValueAsString(
                        java.util.Map.of(
                                "error", "System not ready to resume",
                                "reason", reason));
                return new Response(503, body);
            } catch (Exception e) {
                return new Response(503,
                        "{\"error\":\"System not ready to resume\",\"reason\":\"" + reason + "\"}");
            }
        }

        double lossPct = executor.getCurrentLossPct();
        double latency = executor.getCurrentLatencyMs();
        boolean breached = lossPct > executor.getConfig().getLossCapPct()
                || latency > executor.getConfig().getLatencyMaxMs();

        if (breached) {
            logAttempt("risk_active", "loss=" + lossPct + ",latency=" + latency);
            long start = System.currentTimeMillis();
            while (System.currentTimeMillis() - start < 60_000) {
                if (redis != null && redis.isResumeConfirmed()) {
                    executor.resumeFromPanic();
                    logAttempt("resume_override", "confirmed");
                    try {
                        String body = mapper.writeValueAsString(java.util.Map.of("resumed", true));
                        return new Response(200, body);
                    } catch (Exception e) {
                        return new Response(200, "{\"resumed\":true}");
                    }
                }
                try { Thread.sleep(1000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); break; }
            }
            logAttempt("resume_blocked", "risk breach");
            return new Response(403, "{\"error\":\"Resume blocked due to active risk breach\"}");
        } else {
            executor.resumeFromPanic();
            logAttempt("resume_success", "auto");
            try {
                String body = mapper.writeValueAsString(java.util.Map.of("resumed", true));
                return new Response(200, body);
            } catch (Exception e) {
                return new Response(200, "{\"resumed\":true}");
            }
        }
    }
}
