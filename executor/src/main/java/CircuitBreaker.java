package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Global circuit breaker monitoring win rate and account drawdown.
 * When thresholds are breached trading is halted until reset.
 */
public class CircuitBreaker {
    private static final Logger logger = LoggerFactory.getLogger(CircuitBreaker.class);

    private final double minWinRate;
    private final double maxDrawdownPct;
    private final RedisClient redisClient;
    private boolean tripped = false;

    public CircuitBreaker(RedisClient redisClient, double minWinRate, double maxDrawdownPct) {
        this.redisClient = redisClient;
        this.minWinRate = minWinRate;
        this.maxDrawdownPct = maxDrawdownPct;
    }

    /**
     * Check metrics and trip the breaker if limits are violated.
     * @param winRate current win rate [0-1]
     * @param drawdownPct current drawdown percentage
     */
    public void check(double winRate, double drawdownPct) {
        if (!tripped && (winRate < minWinRate || drawdownPct > maxDrawdownPct)) {
            tripped = true;
            logger.error("CIRCUIT BREAKER TRIPPED winRate={} drawdownPct={}", winRate, drawdownPct);
            AlertManager.sendAlert("CIRCUIT BREAKER TRIPPED");
            redisClient.publish("alerts", "CIRCUIT BREAKER TRIPPED");
            redisClient.publish("control-feed", "halt");
        }
    }

    /**
     * Reset the breaker allowing trading to resume.
     */
    public void reset() {
        tripped = false;
        logger.info("Circuit breaker reset");
    }

    /**
     * @return true if breaker is currently tripped
     */
    public boolean isTripped() {
        return tripped;
    }
}
