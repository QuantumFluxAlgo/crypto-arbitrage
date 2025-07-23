package executor;

/**
 * Utility methods for validating trade execution prices.
 */
public class SlippageChecker {
    /**
     * Check if the actual value is within the allowed slippage of the expected value.
     *
     * @param expected       The expected value.
     * @param actual         The actual value.
     * @param maxSlipPercent The maximum slippage allowed, in percent.
     * @return {@code true} if {@code actual} is within {@code maxSlipPercent}% of {@code expected}; otherwise {@code false}.
     */
    public static boolean check(double expected, double actual, double maxSlipPercent) {
        double difference = Math.abs(actual - expected);
        double allowed = Math.abs(expected) * maxSlipPercent / 100.0;
        return difference <= allowed;
    }

    /**
     * Validate the slippage between expected and actual values.
     * Throws an {@link IllegalArgumentException} if the difference exceeds
     * the provided percentage threshold.
     *
     * @param expected       expected price or edge
     * @param actual         actual price or edge
     * @param maxSlipPercent maximum allowed slippage in percent
     */
    public static void validate(double expected, double actual, double maxSlipPercent) {
        if (!check(expected, actual, maxSlipPercent)) {
            double diffPct = Math.abs(actual - expected) / Math.abs(expected) * 100.0;
            throw new IllegalArgumentException("slippage " + diffPct + "% > " + maxSlipPercent + "%");
        }
    }
}
