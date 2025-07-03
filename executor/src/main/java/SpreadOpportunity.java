package domain;

public class SpreadOpportunity {
    private String pair;
    private String buyExchange;
    private String sellExchange;
    private double expectedProfitUsd;

    public SpreadOpportunity(String pair, String buyExchange, String sellExchange, double expectedProfitUsd) {
        this.pair = pair;
        this.buyExchange = buyExchange;
        this.sellExchange = sellExchange;
        this.expectedProfitUsd = expectedProfitUsd;
    }

    public static SpreadOpportunity fromJson(String json) {
        // TODO: Replace with real deserialization logic (e.g., Jackson/Gson)
        throw new UnsupportedOperationException("JSON parsing not implemented");
    }

    public TradeResult execute(double size, double price) {
        MockExchangeAdapter buyAdapter = new MockExchangeAdapter(buyExchange);
        MockExchangeAdapter sellAdapter = new MockExchangeAdapter(sellExchange);

        long start = System.currentTimeMillis();
        boolean buyOk = buyAdapter.placeOrder(pair, "BUY", size, price);
        boolean sellOk = sellAdapter.placeOrder(pair, "SELL", size, price);
        long latency = System.currentTimeMillis() - start;

        double fee = size * price * 0.001;
        double pnl = expectedProfitUsd - fee;
        boolean success = buyOk && sellOk;

        return new TradeResult(success, pnl, latency);
    }

    public String getPair() {
        return pair;
    }

    public String getBuyExchange() {
        return buyExchange;
    }

    public String getSellExchange() {
        return sellExchange;
    }

    public double getExpectedProfitUsd() {
        return expectedProfitUsd;
    }
}

