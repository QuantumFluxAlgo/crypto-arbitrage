package executor;

/**
 * Combines rule-based scoring with an optional ML predictor
 * to evaluate spread opportunities.
 */
public class ScoringEngine {
    private static final double EDGE_THRESHOLD = 0.002; // 0.2%
    
    private final ModelPredictor predictor;
    private final boolean useEnsemble;
 
    /**
     * Construct using default model and configuration flags.
     */
    public ScoringEngine() {
        this(new DefaultModelPredictor(),
             Boolean.parseBoolean(System.getenv().getOrDefault("USE_ENSEMBLE", "true")));
    }
 
    /**
     * @param predictor   predictor implementation
     * @param useEnsemble whether to blend rule and model scores
     */
    public ScoringEngine(ModelPredictor predictor, boolean useEnsemble) {
        this.predictor = predictor;
        this.useEnsemble = useEnsemble;
    }

    /**
     * Delegate to the configured predictor.
     */
    public double predict(SpreadOpportunity opp) {
        return predictor.predict(opp);
    }
 
    /**
     * Evaluate an opportunity using ensemble scoring.
     */
    public boolean scoreSpread(SpreadOpportunity opp) {
        if (opp == null) {
            return false;
        }
        double ruleEdge = opp.getNetEdge();
        double modelPrediction = predictor.predict(opp);
        double blendedScore = useEnsemble ? 0.6 * ruleEdge + 0.4 * modelPrediction
        : ruleEdge;
        return blendedScore > 0.5 && ruleEdge > EDGE_THRESHOLD;
    }
    
    /**
     * Predict the probability of success for the given spread using the
     * configured model predictor.
     *
     * @param opp spread opportunity
     * @return predicted probability
     */
    public double predictProbability(SpreadOpportunity opp) {
        return predictor.predict(opp);
    }
}
