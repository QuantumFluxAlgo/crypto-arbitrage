package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Decides when to sweep profits to cold wallet based on profit amount and capital ratio.
 */
public class ColdSweeper {
    private static final Logger logger = LoggerFactory.getLogger(ColdSweeper.class);

    private final double minAmountUsd;
    private final double minCapitalRatio;
    private final WalletClient walletClient;
    private final ColdSweeperConfig config;

    /**
     * Default: sweep when profit ≥ $5,000 or ≥ 30% of capital.
     */
    public ColdSweeper() {
        this(5000.0, 0.30, new MockWalletClient(), new ColdSweeperConfig());
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold (e.g. 0.30 = 30%)
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio) {
        this(minAmountUsd, minCapitalRatio, new MockWalletClient(), new ColdSweeperConfig());
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold
     * @param walletClient    wallet client implementation
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio, WalletClient walletClient) {
        this(minAmountUsd, minCapitalRatio, walletClient, new ColdSweeperConfig());
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold
     * @param walletClient    wallet client implementation
     * @param config          configuration loader
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio, WalletClient walletClient, ColdSweeperConfig config) {
        this.minAmountUsd = minAmountUsd;
        this.minCapitalRatio = minCapitalRatio;
        this.walletClient = walletClient;
        this.config = config;
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
        if ((profitUsd / totalCapitalUsd) >= minCapitalRatio) {
            return true;
        }
        return false;
    }

    /**
     * Logs the sweep action. Stub for actual wallet transfer.
     * Uses the address from {@link ColdSweeperConfig}.
     */
    public void sweepToColdWallet() {
        String address = config.getTestColdWalletAddress();
        logger.info("Cold wallet sweep triggered for: {}", address);
        logger.info("Sweeping to cold wallet: {}", address);
        walletClient.withdraw(address);
    }

    /**
     * Logs the sweep action to a custom address.
     *
     * @param address destination cold wallet address
     */
    public void sweepToColdWallet(String address) {
        logger.info("Cold wallet sweep triggered for: {}", address);
        logger.info("Sweeping to cold wallet: {}", address);
        walletClient.withdraw(address);
    }
}
