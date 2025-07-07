package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import executor.SpreadOpportunity;
import executor.ProfitTracker;

public class RiskFilter {
    private static final Logger logger = LoggerFactory.getLogger(RiskFilter.class);

    private double minEdge;
    private long maxLatencyMs;
    private String mode;

    public RiskFilter() {
        this(System.getenv().getOrDefault("PERSONALITY_MODE", "REALISTIC"));
    }

    public RiskFilter(String mode) {
        setMode(mode);
    }

    public RiskFilter(double minEdge, long maxLatencyMs) {
        this.minEdge = minEdge;
        this.maxLatencyMs = maxLatencyMs;
        this.mode = "CUSTOM";
    }

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

    public boolean accept(Spread spread) {
        if (spread == null) {
            logger.warn("Spread is null — rejecting.");
            return false;
        }
        return passes(SpreadOpportunity.fromSpread(spread));
    }

    public boolean passes(SpreadOpportunity opportunity) {
        if (opportunity == null) {
            logger.warn("SpreadOpportunity is null — rejecting.");
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
        return true;
    }
}
