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
    private final SweepLogger sweepLogger;

    /**
     * Default: sweep when profit ≥ $5,000 or ≥ 30% of capital.
     */
    public ColdSweeper() {
        this(5000.0, 0.30, new MockWalletClient(), new ColdSweeperConfig(), null);
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold (e.g. 0.30 = 30%)
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio) {
        this(minAmountUsd, minCapitalRatio, new MockWalletClient(), new ColdSweeperConfig(), null);
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold
     * @param walletClient    wallet client implementation
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio, WalletClient walletClient) {
        this(minAmountUsd, minCapitalRatio, walletClient, new ColdSweeperConfig(), null);
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold
     * @param walletClient    wallet client implementation
     * @param config          configuration loader
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio, WalletClient walletClient, ColdSweeperConfig config) {
        this(minAmountUsd, minCapitalRatio, walletClient, config, null);
    }

    public ColdSweeper(double minAmountUsd, double minCapitalRatio, WalletClient walletClient, ColdSweeperConfig config, SweepLogger logger) {
        this.minAmountUsd = minAmountUsd;
        this.minCapitalRatio = minCapitalRatio;
        this.walletClient = walletClient;
        this.config = config;
        this.sweepLogger = logger;
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
    public void sweepToColdWallet(double amountUsd) {
        String address = config.getTestColdWalletAddress();
        logger.info("Cold wallet sweep triggered for: {} amount {}", address, amountUsd);
        walletClient.withdraw(address, amountUsd);
        ProfitTracker.resetCumulativeProfit();
        if (sweepLogger != null) {
            sweepLogger.logSweep(amountUsd, address, "auto");
        }
    }

    /**
     * Logs the sweep action to a custom address.
     *
     * @param address destination cold wallet address
     * @param amountUsd amount to sweep
     */
    public void sweepToColdWallet(String address, double amountUsd) {
        logger.info("Cold wallet sweep triggered for: {} amount {}", address, amountUsd);
        walletClient.withdraw(address, amountUsd);
        ProfitTracker.resetCumulativeProfit();
        if (sweepLogger != null) {
            sweepLogger.logSweep(amountUsd, address, "manual");
        }
    }
}
