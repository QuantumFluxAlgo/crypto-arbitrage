package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import executor.SpreadOpportunity;

public class RiskFilter {
    private static final Logger logger = LoggerFactory.getLogger(RiskFilter.class);

    private final double minEdge;
    private final long maxLatencyMs;

    public RiskFilter() {
        this(0.005, 250);
    }

    public RiskFilter(double minEdge, long maxLatencyMs) {
        this.minEdge = minEdge;
        this.maxLatencyMs = maxLatencyMs;
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
