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
}

