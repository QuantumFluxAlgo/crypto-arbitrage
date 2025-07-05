import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MockWalletClient implements WalletClient {
    private static final Logger logger = LoggerFactory.getLogger(MockWalletClient.class);

    @Override
    public void withdraw(String address) {
        logger.info("Withdrawing funds to cold wallet: {}", address);
    }
}
