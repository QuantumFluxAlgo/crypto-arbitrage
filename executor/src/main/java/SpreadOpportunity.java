package domain;

public class SpreadOpportunity {
    private final String pair;
    private final String buyExchange;
    private final String sellExchange;
    private final double grossEdge;
    private final double netEdge;
    private long latencyMs;
    private long roundTripLatencyMs;

    public SpreadOpportunity(String pair,
                             String buyExchange,
                             String sellExchange,
                             double grossEdge,
                             double netEdge) {
        this.pair = pair;
        this.buyExchange = buyExchange;
        this.sellExchange = sellExchange;
        this.grossEdge = grossEdge;
        this.netEdge = netEdge;
    }

    public static SpreadOpportunity fromJson(String json) {
        throw new UnsupportedOperationException("JSON parsing not implemented");
    }

    public TradeResult execute(double size, double price) {
        MockExchangeAdapter buy = new MockExchangeAdapter(buyExchange);
        MockExchangeAdapter sell = new MockExchangeAdapter(sellExchange);

        long start = System.currentTimeMillis();
        boolean buyOk = buy.placeOrder(pair, "BUY", size, price);
        boolean sellOk = sell.placeOrder(pair, "SELL", size, price);
        long end = System.currentTimeMillis();
        
        latencyMs = end - start;
        roundTripLatencyMs = latencyMs;
        double fee = size * price * buy.getFeeRate(pair);
        double pnl = netEdge - fee;

        return new TradeResult(buyOk && sellOk, pnl, latencyMs);
    }

    public String getPair() { return pair; }
    public String getBuyExchange() { return buyExchange; }
    public String getSellExchange() { return sellExchange; }
    public double getGrossEdge() { return grossEdge; }
    public double getNetEdge() { return netEdge; }
    public long getLatencyMs() { return latencyMs; }
    public long getRoundTripLatencyMs() { return roundTripLatencyMs; }
}

