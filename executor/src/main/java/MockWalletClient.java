package executor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Dummy wallet client used by tests to simulate withdrawals.
 */
public class MockWalletClient implements WalletClient {
    private static final Logger logger = LoggerFactory.getLogger(MockWalletClient.class);

    /** {@inheritDoc} */
    @Override
    public void withdraw(String address, double amountUsd) {
        logger.info("Withdrawing {} USD to cold wallet: {}", amountUsd, address);
    }
}
