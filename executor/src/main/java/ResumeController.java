package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Handles resume requests with safety checks.
 */
public class ResumeController {
    private static final Logger logger = LoggerFactory.getLogger(ResumeController.class);

    private final Executor executor;
    private final SystemHealthChecker checker;
    private final ObjectMapper mapper = new ObjectMapper();

    /** Simple container for HTTP-like responses. */
    public static class Response {
        public final int status;
        public final String body;
        Response(int status, String body) {
            this.status = status;
            this.body = body;
        }
    }

    public ResumeController(Executor executor, SystemHealthChecker checker) {
        this.executor = executor;
        this.checker = checker == null ? new SystemHealthChecker() : checker;
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

        executor.resumeFromPanic();
        try {
            String body = mapper.writeValueAsString(java.util.Map.of("resumed", true));
            return new Response(200, body);
        } catch (Exception e) {
            return new Response(200, "{\"resumed\":true}");
        }
    }
}
