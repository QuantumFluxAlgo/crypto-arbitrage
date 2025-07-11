package executor;

/**
 * Configuration holder for {@link ColdSweeper}.
 * Loads the cold wallet address from the environment.
 */
public class ColdSweeperConfig {
    private final String testColdWalletAddress;

    /**
     * Load configuration from environment variables.
     */
    public ColdSweeperConfig() {
        this.testColdWalletAddress =
                System.getenv().getOrDefault("TEST_COLD_WALLET_ADDRESS", "test_wallet_addr");
    }

    /**
     * @return address used for sweeping profits in tests
     */
    public String getTestColdWalletAddress() {
        return testColdWalletAddress;
    }
}

