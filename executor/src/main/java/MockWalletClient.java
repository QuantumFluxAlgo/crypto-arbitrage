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
    public void withdraw(String address) {
        logger.info("Withdrawing funds to cold wallet: {}", address);
    }
}
