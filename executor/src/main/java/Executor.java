import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Objects;

public class Executor {
    private static final Logger logger = LoggerFactory.getLogger(Executor.class);

    private final RedisClient redisClient;
    private final RiskFilter riskFilter;
    private final NearMissLogger nearMissLogger;

    public Executor(RedisClient redisClient, RiskFilter riskFilter, NearMissLogger nearMissLogger) {
        this.redisClient = redisClient;
        this.riskFilter = riskFilter;
        this.nearMissLogger = nearMissLogger;
    }

    public void start() {
        logger.info("Starting Redis client thread");
        redisClient.start();
    }

    private void handleMessage(String message) {
        logger.debug("Received message: {}", message);
        SpreadOpportunity opp = SpreadOpportunity.fromJson(message);
        logger.debug("Parsed opportunity: {}", opp);

        nearMissLogger.log(opp, "rejected_by_risk_filter");
            logger.info("Opportunity rejected by risk filter");
            nearMissLogger.log(opp, "risk-filter");
            return;
        }

        logger.info("EXECUTING...");
        // Simulate IOC trade execution on buy and sell exchanges
              MockExchangeAdapter buyAdapter = new MockExchangeAdapter(opp.getBuyExchange());
              MockExchangeAdapter sellAdapter = new MockExchangeAdapter(opp.getSellExchange());

              double size = 1.0;
              double price = 1.0;
              double feeRate = 0.001;

              boolean buyOk = buyAdapter.placeOrder(opp.getPair(), "BUY", size, price);
              boolean sellOk = sellAdapter.placeOrder(opp.getPair(), "SELL", size, price);

              if (buyOk && sellOk) {
                  double fee = size * price * feeRate;
                  double pnl = opp.getExpectedProfitUsd() - fee;
                  TradeLogger.log(opp, pnl);
                  ProfitTracker.record(pnl);
              } else {
                  logger.error("Failed to execute trade: buyOk={} sellOk={}", buyOk, sellOk);
              }
          }
      }
