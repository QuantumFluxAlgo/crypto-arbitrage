import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Decides when to sweep profits to cold wallet based on profit amount and capital ratio.
 */
public class ColdSweeper {
    private static final Logger logger = LoggerFactory.getLogger(ColdSweeper.class);

    private final double minAmountUsd;
    private final double minCapitalRatio;

    /**
     * Default: sweep when profit ≥ $5,000 or ≥ 30% of capital.
     */
    public ColdSweeper() {
        this(5000.0, 0.30);
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold (e.g. 0.30 = 30%)
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio) {
        this.minAmountUsd = minAmountUsd;
        this.minCapitalRatio = minCapitalRatio;
    }

    /**
     * Evaluate sweep condition.
     *
     * @param profitUsd        realized profit in USD
     * @param totalCapitalUsd  current working capital in USD
     * @return true if sweep threshold is met
     */
    public boolean shouldSweep(double profitUsd, double totalCapitalUsd) {
        if (profitUsd >= minAmountUsd) {
            return true;
        }
        if (totalCapitalUsd <= 0) {
            return false;
        }
        return (profitUsd / totalCapitalUsd) >= minCapitalRatio;
    }

    /**
     * Logs the sweep action. Stub for actual wallet transfer.
     *
     * @param address destination cold wallet address
     */
    public void sweepToColdWallet(String address) {
        logger.info("Sweeping to cold wallet: {}", address);
    }
}
