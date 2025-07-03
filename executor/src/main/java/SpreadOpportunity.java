public class SpreadOpportunity {
    public String pair;
    public String buyExchange;
    public String sellExchange;
    public double grossEdge;
    public double netEdge;
    public double expectedProfitUsd;
    public long latencyMs;

    public SpreadOpportunity(String pair, String buyExchange, String sellExchange,
                             double grossEdge, double netEdge, double expectedProfitUsd,
                             long latencyMs) {
        this.pair = pair;
        this.buyExchange = buyExchange;
        this.sellExchange = sellExchange;
        this.grossEdge = grossEdge;
        this.netEdge = netEdge;
        this.expectedProfitUsd = expectedProfitUsd;
        this.latencyMs = latencyMs;
    }

    @Override
    public String toString() {
        return "SpreadOpportunity{" +
            "pair='" + pair + '\'' +
            ", buyExchange='" + buyExchange + '\'' +
            ", sellExchange='" + sellExchange + '\'' +
            ", grossEdge=" + grossEdge +
            ", netEdge=" + netEdge +
            ", expectedProfitUsd=" + expectedProfitUsd +
            ", latencyMs=" + latencyMs +
            '}';
    }
}

