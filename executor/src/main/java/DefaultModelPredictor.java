package executor;

/**
 * Trivial {@link ModelPredictor} implementation that always
 * returns {@code 0.0}. Used as a placeholder when no
 * predictive model is configured.
 */
public class DefaultModelPredictor implements ModelPredictor {

    /**
     * {@inheritDoc}
     */
    @Override
    public double predict(SpreadOpportunity opp) {
        return 0.0;
    }
}
