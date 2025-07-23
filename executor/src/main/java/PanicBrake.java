// Halts trading when loss or latency exceed limits
package executor;

/**
 * Utility class that determines when trading should halt based on a few
 * safety thresholds. Default values are 5% daily loss, 250&nbsp;ms latency
 * and a 50% win rate. Thresholds may be overridden via {@link Config}
 * or environment variables and are checked in the static
 * {@link #shouldHalt(RedisClient, Config, double, double, double)} method.
 */
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import executor.ProfitTracker;
import executor.RedisClient;
import executor.Config;
import com.fasterxml.jackson.databind.json.JsonMapper;

public class PanicBrake {
    private static final Logger logger = LoggerFactory.getLogger(PanicBrake.class);

    /**
     * Returns {@code true} when any of the safety thresholds are breached.
     *
     * @param dailyLossPct percentage of daily loss
     * @param avgLatencyMs average latency in milliseconds
     * @param winRate      overall win rate
     * @return {@code true} if trading should halt
     */

    private static double getLossCapPct(Config config) {
        if (config != null) {
            return config.getLossCapPct();
        }
        String val = System.getProperty("LOSS_CAP_PCT",
                System.getenv().getOrDefault("LOSS_CAP_PCT", "5.0"));
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return 5.0;
        }
    }

    private static double getLatencyMaxMs(Config config) {
        if (config != null) {
            return config.getLatencyMaxMs();
        }
        String val = System.getProperty("LATENCY_MAX_MS",
                System.getenv().getOrDefault("LATENCY_MAX_MS", "250"));
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return 250.0;
        }
    }

    private static double getWinRateThreshold(Config config) {
        if (config != null) {
            return config.getWinRateThreshold();
        }
        String val = System.getProperty("WIN_RATE_THRESHOLD",
                System.getenv().getOrDefault("WIN_RATE_THRESHOLD", "0.5"));
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return 0.5;
        }
    }

    private static double getProfitTargetUsd() {
        String val = System.getProperty("PROFIT_TARGET_USD",
                System.getenv().getOrDefault("PROFIT_TARGET_USD", "0.0"));
        try {
            return Double.parseDouble(val);
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    public static boolean shouldHalt(RedisClient redis, Config config,
                                     double dailyLossPct, double avgLatencyMs, double winRate) {
        double lossCap = getLossCapPct(config);
        double latencyCap = getLatencyMaxMs(config);
        double winRateThresh = getWinRateThreshold(config);
        double profitTarget = getProfitTargetUsd();
        double profitSoFar = ProfitTracker.getCumulativeProfit();

        boolean triggered = false;
        String reason = null;
        double value = 0.0;

        if (dailyLossPct > lossCap) {
            reason = "loss";
            value = -dailyLossPct;
        } else if (avgLatencyMs > latencyCap) {
            reason = "latency";
            value = avgLatencyMs;
        } else if (winRate < winRateThresh) {
            reason = "win_rate";
            value = winRate;
        } else if (profitTarget > 0 && profitSoFar >= profitTarget) {
            reason = "profit_target";
            value = profitSoFar;
        }

        if (reason != null) {
            logger.error(
                    com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                            .createObjectNode()
                            .put("event", "panic")
                            .put("reason", reason)
                            .put("value", value)
                            .put("ts", java.time.Instant.now().toString())
                            .toString());
            triggered = true;
        }

        if (triggered && redis != null && config != null && !config.isDryRun()) {
            redis.publishControl(config, "pause");
        }

        return triggered;
    }
}

