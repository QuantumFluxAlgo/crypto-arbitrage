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
}
