package executor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Represents an executable arbitrage opportunity between two exchanges.
 */
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

    /**
     * Create an opportunity with the given parameters.
     */
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

    /**
     * Parse an opportunity from a JSON payload.
     */
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

    /**
     * Convert a simple spread into a SpreadOpportunity instance.
     */
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

    /**
     * Execute the opportunity using mock exchanges.
     */
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

    /** @return trading pair */
    public String getPair() { return pair; }
    /** @return buy exchange name */
    public String getBuyExchange() { return buyExchange; }
    /** @return sell exchange name */
    public String getSellExchange() { return sellExchange; }
    /** @return gross edge value */
    public double getGrossEdge() { return grossEdge; }
    /** @return net edge value */
    public double getNetEdge() { return netEdge; }
    /** @return measured latency in ms */
    public long getLatencyMs() { return latencyMs; }
    /** @return round trip latency in ms */
    public long getRoundTripLatencyMs() { return roundTripLatencyMs; }
    /** @return latency in microseconds */
    public long getLatencyMicros() { return latencyMicros; }
    /** @return round trip latency in microseconds */
    public long getRoundTripLatencyMicros() { return roundTripLatencyMicros; }
}

