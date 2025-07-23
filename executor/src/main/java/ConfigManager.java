package executor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

/**
 * Loads and maintains runtime risk configuration from Redis.
 * Every update is validated before being applied.
 */
public class ConfigManager {
    private static final Logger logger = LoggerFactory.getLogger(ConfigManager.class);
    private static final Path REJECT_LOG = Path.of("logs", "config_reject.log");

    private final String redisHost;
    private final int redisPort;

    private double maxLossPct;
    private double latencyMaxMs;
    private double coinExposureLimit;

    public ConfigManager(String redisHost, int redisPort, double maxLossPct,
                         double latencyMaxMs, double coinExposureLimit) {
        this.redisHost = redisHost;
        this.redisPort = redisPort;
        this.maxLossPct = maxLossPct;
        this.latencyMaxMs = latencyMaxMs;
        this.coinExposureLimit = coinExposureLimit;
    }

    public double getMaxLossPct() {
        return maxLossPct;
    }

    public double getLatencyMaxMs() {
        return latencyMaxMs;
    }

    public double getCoinExposureLimit() {
        return coinExposureLimit;
    }

    /** Reload configuration from Redis and validate before applying. */
    public void reload() {
        try (Jedis jedis = new Jedis(redisHost, redisPort)) {
            String json = jedis.get("executor:config");
            if (json != null) {
                applyJson(json);
            }
        } catch (Exception e) {
            logger.warn("Failed to reload config from redis: {}", e.getMessage());
        }
    }

    /** Visible for tests: apply a config JSON string. */
    void applyJson(String json) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(json);
        double newLoss = node.path("maxLossPct").asDouble(maxLossPct);
        double newLatency = node.path("latencyMaxMs").asDouble(latencyMaxMs);
        double newExposure = node.path("coinExposureLimit").asDouble(coinExposureLimit);

        ConfigValidator validator = new ConfigValidator(newLoss, newLatency,
                0.5, 1.0, 0.0);
        try {
            validator.validate();
            String bad = ConfigValidator.validateRiskLimits(newLoss, newLatency, newExposure);
            if (bad != null) {
                reject(bad);
                return;
            }
            this.maxLossPct = newLoss;
            this.latencyMaxMs = newLatency;
            this.coinExposureLimit = newExposure;
            logger.info("Config updated: loss={} latency={} exposure={}",
                    newLoss, newLatency, newExposure);
        } catch (RuntimeException ex) {
            reject(ex.getMessage());
        }
    }

    private void reject(String reason) {
        logger.warn("Invalid config rejected: {}", reason);
        try {
            Files.createDirectories(REJECT_LOG.getParent());
            Files.writeString(REJECT_LOG,
                    reason + System.lineSeparator(),
                    StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException e) {
            logger.error("Failed to write rejection log: {}", e.getMessage());
        }
    }
}
