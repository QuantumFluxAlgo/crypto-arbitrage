import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ColdSweeper {
    private static final Logger logger = LoggerFactory.getLogger(ColdSweeper.class);

    public boolean shouldSweep(double realizedProfitUsd, double totalCapitalUsd) {
        return realizedProfitUsd >= 5000 || realizedProfitUsd >= 0.3 * totalCapitalUsd;
    }

    public void sweepToColdWallet(String address) {
        logger.info("Sweeping to cold wallet: 0xTESTWALLET123");
    }
}
