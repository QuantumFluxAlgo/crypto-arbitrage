package executor;

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
}

