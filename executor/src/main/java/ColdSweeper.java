package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import executor.Config;
import executor.ExecutionMode;

/**
 * Decides when to sweep profits to cold wallet based on profit amount and capital ratio.
 */
public class ColdSweeper {
    private static final Logger logger = LoggerFactory.getLogger(ColdSweeper.class);

    private final double minAmountUsd;
    private final double minCapitalRatio;
    private final WalletClient walletClient;
    private final ColdSweeperConfig sweeperConfig;
    private final SweepLogger sweepLogger;
    private final Config config;
    private final boolean isDryRun;
    private final java.util.concurrent.atomic.AtomicBoolean busy = new java.util.concurrent.atomic.AtomicBoolean(false);

    private void logDryRunSweep(String trigger, double amountUsd) {
        String log = String.format(
                "{\"event\":\"cold_wallet_sweep\",\"mode\":\"dry-run\",\"trigger\":\"%s\",\"actions\":[\"sweep-from:Binance\",\"amount:%.1f USDT\"],\"status\":\"skipped\",\"ts\":\"%s\"}",
                trigger,
                Math.round(amountUsd * 10.0) / 10.0,
                java.time.Instant.now().toString());
        logger.info(log);
    }

    /**
     * Default: sweep when profit ≥ $5,000 or ≥ 30% of capital.
     */
    public ColdSweeper() {
        this(5000.0, 0.30, new MockWalletClient(), new ColdSweeperConfig(), null, new Config(ExecutionMode.LIVE));
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold (e.g. 0.30 = 30%)
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio) {
        this(minAmountUsd, minCapitalRatio, new MockWalletClient(), new ColdSweeperConfig(), null, new Config(ExecutionMode.LIVE));
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold
     * @param walletClient    wallet client implementation
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio, WalletClient walletClient) {
        this(minAmountUsd, minCapitalRatio, walletClient, new ColdSweeperConfig(), null, new Config(ExecutionMode.LIVE));
    }

    /**
     * @param minAmountUsd    absolute profit threshold
     * @param minCapitalRatio relative profit threshold
     * @param walletClient    wallet client implementation
     * @param sweeperConfig   configuration loader
     */
    public ColdSweeper(double minAmountUsd, double minCapitalRatio, WalletClient walletClient, ColdSweeperConfig sweeperConfig) {
        this(minAmountUsd, minCapitalRatio, walletClient, sweeperConfig, null, new Config(ExecutionMode.LIVE));
    }

    public ColdSweeper(double minAmountUsd, double minCapitalRatio, WalletClient walletClient, ColdSweeperConfig sweeperConfig, SweepLogger logger) {
        this(minAmountUsd, minCapitalRatio, walletClient, sweeperConfig, logger, new Config(ExecutionMode.LIVE));
    }

    public ColdSweeper(double minAmountUsd, double minCapitalRatio, WalletClient walletClient, ColdSweeperConfig sweeperConfig, SweepLogger logger, Config configObj) {
        this.minAmountUsd = minAmountUsd;
        this.minCapitalRatio = minCapitalRatio;
        this.walletClient = walletClient;
        this.sweeperConfig = sweeperConfig;
        this.sweepLogger = logger;
        this.config = configObj;
        this.isDryRun = configObj != null && configObj.isDryRun();
    }

    /** @return true if a sweep is currently in progress */
    public boolean isBusy() {
        return busy.get();
    }

    private String maskAddress(String address) {
        if (address == null || address.length() <= 10) {
            return "********";
        }
        String start = address.substring(0, 6);
        String end = address.substring(address.length() - 4);
        return start + "****" + end;
    }

    /**
     * Evaluate sweep condition.
     *
     * @param profitUsd        realized profit in USD
     * @param totalCapitalUsd  current working capital in USD
     * @return true if sweep threshold is met
     */
    public boolean shouldSweep(double profitUsd, double totalCapitalUsd) {
        boolean result = false;
        if (profitUsd >= minAmountUsd) {
            result = true;
        } else if (totalCapitalUsd > 0 && (profitUsd / totalCapitalUsd) >= minCapitalRatio) {
            result = true;
        }
        if (isDryRun) {
            String log = String.format(
                    "{\"event\":\"sweep_trigger_eval\",\"result\":%s,\"mode\":\"dry-run\",\"ts\":\"%s\"}",
                    result, java.time.Instant.now().toString());
            logger.info(log);
        }
        return result;
    }

    /**
     * Logs the sweep action. Stub for actual wallet transfer.
     * Uses the address from {@link ColdSweeperConfig}.
     */
    public void sweepToColdWallet(double amountUsd) {
        busy.set(true);
        try {
            String address = sweeperConfig.getTestColdWalletAddress();
            logger.info("Cold wallet sweep triggered for: {} amount {}", maskAddress(address), amountUsd);
            if (isDryRun) {
                logger.info("[DRY-RUN MODE] Cold wallet sweep logic verified. No assets moved.");
                logDryRunSweep("auto", amountUsd);
            } else {
                walletClient.withdraw(address, amountUsd);
            }
            ProfitTracker.resetCumulativeProfit();
            if (sweepLogger != null) {
                sweepLogger.logSweep(amountUsd, address, "auto");
            }
        } catch (Exception e) {
            logger.error("[SWEEP ERROR] Sweep failed: {}", e.getMessage());
        } finally {
            busy.set(false);
        }
    }

    /**
     * Logs the sweep action to a custom address.
     *
     * @param address destination cold wallet address
     * @param amountUsd amount to sweep
     */
    public void sweepToColdWallet(String address, double amountUsd) {
        busy.set(true);
        try {
            logger.info("Cold wallet sweep triggered for: {} amount {}", maskAddress(address), amountUsd);
            if (isDryRun) {
                logger.info("[DRY-RUN MODE] Cold wallet sweep logic verified. No assets moved.");
                logDryRunSweep("manual", amountUsd);
            } else {
                walletClient.withdraw(address, amountUsd);
            }
            ProfitTracker.resetCumulativeProfit();
            if (sweepLogger != null) {
                sweepLogger.logSweep(amountUsd, address, "manual");
            }
        } catch (Exception e) {
            logger.error("[SWEEP ERROR] Sweep failed: {}", e.getMessage());
        } finally {
            busy.set(false);
        }
    }
}
