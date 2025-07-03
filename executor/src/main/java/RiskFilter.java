import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
        if (spread.getEdge() < minEdge) {
            logger.info("Spread rejected: edge {} < {}", spread.getEdge(), minEdge);
            return false;
        }
        if (spread.getLatencyMs() > maxLatencyMs) {
            logger.info("Spread rejected: latency {} > {}", spread.getLatencyMs(), maxLatencyMs);
            return false;
        }
        return true;
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
