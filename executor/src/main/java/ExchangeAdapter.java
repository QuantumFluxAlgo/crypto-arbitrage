package executor;

import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Abstraction for exchange specific order and balance operations.
 */
public interface ExchangeAdapter {
    /**
     * Place an order on the exchange.
     *
     * @param pair       trading pair, e.g. "BTC/USDT"
     * @param side       "buy" or "sell"
     * @param size       amount to buy or sell
     * @param limitPrice price per unit
     * @return true if the order was filled
     */
    boolean placeOrder(String pair, String side, double size, double limitPrice);

    /**
     * Place an immediate-or-cancel (IOC) order on the exchange.
     * Default implementation delegates to {@link #placeOrder(String, String, double, double)}.
     *
     * @param pair       trading pair, e.g. "BTC/USDT"
     * @param side       "buy" or "sell"
     * @param size       amount to buy or sell
     * @param limitPrice price per unit
     * @return true if the order was fully filled immediately
     */
    default boolean placeIocOrder(String pair, String side, double size, double limitPrice) {
        return placeOrder(pair, side, size, limitPrice);
    }

    /**
     * Get the trading fee rate for the specified pair.
     *
     * @param pair trading pair, e.g. "BTC/USDT"
     * @return fee rate (e.g. 0.001 for 0.1%)
     */
    double getFeeRate(String pair);

    /**
     * Get the balance for the given asset.
     *
     * @param asset asset symbol
     * @return available balance
     */
    double getBalance(String asset);

    /**
     * Transfer funds to another destination (exchange, wallet, etc.).
     *
     * @param asset       asset symbol
     * @param amount      amount to transfer
     * @param destination target destination identifier
     */
    void transfer(String asset, double amount, String destination);

    /**
     * Cancel an existing order. Default implementation is a no-op so tests can
     * override as needed.
     *
     * @param orderId unique order identifier
     */
    default void cancel(String orderId) {
        // no-op
    }

    /**
     * Attempt to establish a WebSocket connection with retry logic. If all
     * attempts fail, a REST fallback is executed. Any failure of the fallback
     * escalates to the caller via {@link RuntimeException}.
     *
     * @param wsConnect   runnable that performs the WebSocket connect
     * @param restFallback runnable that performs the REST fallback
     * @param exchangeName exchange identifier used in logs
     */
    default void connectWithRetry(Runnable wsConnect, Runnable restFallback, String exchangeName) {
        Logger log = LoggerFactory.getLogger(getClass());
        int maxRetries = 5;
        long delay = 1000L;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                wsConnect.run();
                return;
            } catch (Exception e) {
                log.warn("WebSocket attempt {}/{} failed for {} at {}", attempt, maxRetries, exchangeName, Instant.now(), e);
                if (attempt == maxRetries) {
                    log.error("WebSocket unavailable for {} – falling back to REST", exchangeName);
                    try {
                        restFallback.run();
                        return;
                    } catch (Exception restEx) {
                        log.error("REST fallback failed for {} at {}", exchangeName, Instant.now(), restEx);
                        throw new RuntimeException("REST fallback failed for " + exchangeName, restEx);
                    }
                }
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
                delay = Math.min(delay * 2, 10000L);
            }
        }
    }
}

