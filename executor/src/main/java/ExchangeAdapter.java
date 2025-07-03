public interface ExchangeAdapter {
    boolean placeOrder(String pair, String side, double size, double limitPrice);
    double getFeeRate(String pair);
    double getBalance(String asset);
}
