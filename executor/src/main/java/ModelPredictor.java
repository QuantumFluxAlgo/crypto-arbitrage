package executor;

/**
 * Predicts the probability of success for a given {@link SpreadOpportunity}.
 */
public interface ModelPredictor {

    /**
     * Predict the probability or score for the provided opportunity.
     *
     * @param opp opportunity to evaluate
     * @return model prediction value
     */
    double predict(SpreadOpportunity opp);
}
