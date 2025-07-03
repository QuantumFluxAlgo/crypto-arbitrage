import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RiskFilter {
    private static final Logger logger = LoggerFactory.getLogger(RiskFilter.class);

    private final double netEdgeThreshold;
    private final long maxLatencyMs;

    public RiskFilter() {
        this(0.005, 250);
    }

    public RiskFilter(double netEdgeThreshold, long maxLatencyMs) {
        this.netEdgeThreshold = netEdgeThreshold;
        this.maxLatencyMs = maxLatencyMs;
    }

    public boolean passes(SpreadOpportunity opportunity) {
        if (opportunity.getNetEdge() < netEdgeThreshold) {
            logger.info("Spread opportunity failed edge threshold: {} < {}", opportunity.getNetEdge(), netEdgeThreshold);
            return false;
        }
