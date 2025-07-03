public class SpreadOpportunity implements SpreadOpportunityInfo {
    public final String pair;
    public final String buyExchange;
    public final String sellExchange;
    public final double grossEdge;
    public final double netEdge;
    public final double expectedProfitUsd;
    public final long latencyMs;

    private final String rawJson;

    private SpreadOpportunity(String rawJson,
                              String pair, String buyExchange, String sellExchange,
                              double grossEdge, double netEdge, double expectedProfitUsd,
                              long latencyMs) {
        this.rawJson = rawJson;
        this.pair = pair;
        this.buyExchange = buyExchange;
        this.sellExchange = sellExchange;
        this.grossEdge = grossEdge;
        this.netEdge = netEdge;
        this.expectedProfitUsd = expectedProfitUsd;
        this.latencyMs = latencyMs;
    }

    public static SpreadOpportunity fromJson(String json) {
        // Placeholder JSON parsing: real code should use Jackson/Gson/etc.
        // This is mock data to demonstrate structure
        return new SpreadOpportunity(
            json,
            "BTC/USDT", "Binance", "Kr

