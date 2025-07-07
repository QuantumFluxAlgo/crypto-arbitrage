package executor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class SpreadOpportunity {
    private final String pair;
    private final String buyExchange;
    private final String sellExchange;
    private final double grossEdge;
    private final double netEdge;
    private long latencyMs;
    private long roundTripLatencyMs;
    private long latencyMicros;
    private long roundTripLatencyMicros;

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
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(json);
            return new SpreadOpportunity(
                node.get("pair").asText(),
                node.get("buyExchange").asText(),
                node.get("sellExchange").asText(),
                node.get("grossEdge").asDouble(),
                node.get("netEdge").asDouble()
            );
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid opportunity JSON", e);
        }
    }

    public static SpreadOpportunity fromSpread(Spread spread) {
        SpreadOpportunity opp = new SpreadOpportunity(
            "",
            "",
            "",
            spread.getEdge(),
            spread.getEdge()
        );
        opp.latencyMs = spread.getLatencyMs();
        opp.roundTripLatencyMs = spread.getLatencyMs();
        opp.latencyMicros = spread.getLatencyMs() * 1000;
        opp.roundTripLatencyMicros = spread.getLatencyMs() * 1000;
        return opp;
    }

    public TradeResult execute(double size, double price) {
        MockExchangeAdapter buy = new MockExchangeAdapter(buyExchange);
        MockExchangeAdapter sell = new MockExchangeAdapter(sellExchange);

        long start = System.nanoTime();
        boolean buyOk = buy.placeIocOrder(pair, "BUY", size, price);
        boolean sellOk = sell.placeIocOrder(pair, "SELL", size, price);
        long end = System.nanoTime();

        latencyMicros = (end - start) / 1000;
        roundTripLatencyMicros = latencyMicros;
        latencyMs = latencyMicros / 1000;
        roundTripLatencyMs = latencyMs;
        double fee = size * price * buy.getFeeRate(pair);
        double pnl = netEdge - fee;
        boolean success = buyOk && sellOk && latencyMicros <= 60;

        return new TradeResult(success, success ? pnl : 0.0, latencyMs);
    }

    public String getPair() { return pair; }
    public String getBuyExchange() { return buyExchange; }
    public String getSellExchange() { return sellExchange; }
    public double getGrossEdge() { return grossEdge; }
    public double getNetEdge() { return netEdge; }
    public long getLatencyMs() { return latencyMs; }
    public long getRoundTripLatencyMs() { return roundTripLatencyMs; }
    public long getLatencyMicros() { return latencyMicros; }
    public long getRoundTripLatencyMicros() { return roundTripLatencyMicros; }
}

