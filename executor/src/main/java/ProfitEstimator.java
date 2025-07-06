package executor;

/**
 * Simple profit estimator used when running in sandbox mode.
 */
public class ProfitEstimator {
    /**
     * Estimate profit for the given opportunity.
     *
     * @param opp spread opportunity
     * @return estimated profit
     */
    public double estimate(SpreadOpportunity opp) {
        if (opp == null) {
            return 0.0;
        }
        return opp.getNetEdge();
    }
}
