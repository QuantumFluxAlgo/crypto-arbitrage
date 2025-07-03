import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ColdSweeper {
    private static final Logger logger = LoggerFactory.getLogger(ColdSweeper.class);
    private final double capital;

    public ColdSweeper(double capital) {
        this.capital = capital;
    }

    /**
     * Decide if a sweep should occur based on profit and configured capital.
     *
     * @param profit realized profit in USD
     * @return true if sweep threshold is met
     */
    public boolean shouldSweep(double profit) {
        return profit >= 5000 || profit >= 0.3 * capital;
    }

    /**
     * Sweep profits to cold wallet. In production, this would initiate a transfer.
     *
     * @param address cold wallet address
     */
    public void sweepToColdWallet(String address) {
        logger.info("Sweeping to cold wallet: {}", address);
    }
}

