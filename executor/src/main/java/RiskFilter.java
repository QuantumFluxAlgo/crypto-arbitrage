package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import executor.SpreadOpportunity;
import executor.ProfitTracker;

/**
 * Applies configurable thresholds to determine whether an opportunity
 * is safe enough to execute.
 */
public class RiskFilter {
    private static final Logger logger = LoggerFactory.getLogger(RiskFilter.class);

    private double minEdge;
    private long maxLatencyMs;
    private double maxSlippagePct = Double.parseDouble(
        System.getenv().getOrDefault("MAX_SLIPPAGE_PCT", "1.0"));
    private String mode;

    /** Construct using the default personality mode. */
    public RiskFilter() {
        this(System.getenv().getOrDefault("PERSONALITY_MODE", "REALISTIC"));
    }

    /**
     * Construct using a personality mode string.
     * @param mode personality mode
     */
    public RiskFilter(String mode) {
        setMode(mode);
    }

    /**
     * Create a custom filter with explicit thresholds.
     *
     * @param netEdge    minimum net edge required
     * @param latencyMs  maximum allowable latency in milliseconds
     */
    public RiskFilter(double netEdge, long latencyMs, double maxSlippagePct) {
        this.minEdge = netEdge;
        this.maxLatencyMs = latencyMs;
        this.maxSlippagePct = maxSlippagePct;
        this.mode = "CUSTOM";
    }

    /**
     * Update the filter based on the provided personality mode.
     *
     * @param mode mode name
     */
    public void setMode(String mode) {
        this.mode = mode == null ? "REALISTIC" : mode.toUpperCase();
        switch (this.mode) {
            case "AGGRESSIVE" -> {
                this.minEdge = 0.002;
                this.maxLatencyMs = 300;
            }
            case "AUTO" -> {
                double perf = ProfitTracker.getGlobalTotal();
                this.minEdge = perf >= 0 ? 0.002 : 0.005;
                this.maxLatencyMs = 250;
            }
            case "REALISTIC" -> {
                this.minEdge = 0.005;
                this.maxLatencyMs = 250;
            }
            default -> {
                this.minEdge = 0.005;
                this.maxLatencyMs = 250;
            }
        }
        logger.info("RiskFilter mode set to {} (minEdge={}, latency={})", this.mode, this.minEdge, this.maxLatencyMs);
    }

    /**
     * Evaluate a simple spread object.
     */
    public boolean accept(Spread spread) {
        if (spread == null) {
            logger.warn("Spread is null — rejecting.");
            return false;
        }
        return passes(SpreadOpportunity.fromSpread(spread));
    }

    /**
     * @return maximum allowed latency in milliseconds
     */
    public long getMaxLatencyMs() {
        return maxLatencyMs;
    }

    /**
     * Evaluate a full spread opportunity.
     *
     * @param opportunity spread opportunity
     * @return true if the opportunity passes risk checks
     */
    public boolean passes(SpreadOpportunity opportunity) {
        if (opportunity == null) {
            logger.warn("SpreadOpportunity is null — rejecting.");
            return false;
        }
        if (Double.isNaN(opportunity.getNetEdge()) || opportunity.getNetEdge() <= 0) {
            logger.warn("SpreadOpportunity has invalid netEdge {}", opportunity.getNetEdge());
            return false;
        }
        if (opportunity.getNetEdge() < minEdge) {
            logger.info("SpreadOpportunity rejected: netEdge {} < {}", opportunity.getNetEdge(), minEdge);
            return false;
        }
        if (opportunity.getRoundTripLatencyMs() > maxLatencyMs) {
            logger.info("SpreadOpportunity rejected: latency {} > {}", opportunity.getRoundTripLatencyMs(), maxLatencyMs);
            return false;
        }
        double slippage = Math.abs(opportunity.getGrossEdge() - opportunity.getNetEdge());
        if (Math.abs(opportunity.getGrossEdge()) > 0) {
            double slipPct = slippage / Math.abs(opportunity.getGrossEdge()) * 100.0;
            if (slipPct > maxSlippagePct) {
                logger.info("SpreadOpportunity rejected: slippage {}% > {}%", slipPct, maxSlippagePct);
                return false;
            }
        }
        return true;
    }
}
