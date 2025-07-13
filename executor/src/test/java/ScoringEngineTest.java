package executor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import static org.junit.jupiter.api.Assertions.*;

@Tag("local")
public class ScoringEngineTest {
    static class FixedPredictor implements ModelPredictor {
        private final double value;
        FixedPredictor(double value) { this.value = value; }
        @Override
        public double predict(SpreadOpportunity opp) { return value; }
    }

    @Test
    void passesWhenBlendedScoreHigh() {
        ScoringEngine engine = new ScoringEngine(new FixedPredictor(0.8), true);
        SpreadOpportunity opp = new SpreadOpportunity("BTC/USDT", "A", "B", 0.6, 0.6, 0L);
        assertTrue(engine.scoreSpread(opp));
    }

    @Test
    void rejectsWhenBlendedScoreLow() {
        ScoringEngine engine = new ScoringEngine(new FixedPredictor(0.1), true);
        SpreadOpportunity opp = new SpreadOpportunity("BTC/USDT", "A", "B", 0.1, 0.1, 0L);
        assertFalse(engine.scoreSpread(opp));
    }
}
