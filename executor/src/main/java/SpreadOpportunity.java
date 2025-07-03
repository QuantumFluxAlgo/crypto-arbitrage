public class SpreadOpportunity {
    private final String pair;
    private final String buyExchange;
    private final String sellExchange;
    private final double grossEdge;
    private final double netEdge;
    private final double expectedProfitUsd;
    private final long roundTripLatencyMs;

    public SpreadOpportunity(
            String pair,
            String buyExchange,
            String sellExchange,
            double grossEdge,
            double netEdge,
            double expectedProfitUsd,
            long roundTripLatencyMs) {
        this.pair = pair;
        this.buyExchange = buyExchange;
        this.sellExchange = sellExchange;
        this.grossEdge = grossEdge;
        this.netEdge = netEdge;
        this.expectedProfitUsd = expectedProfitUsd;
        this.roundTripLatencyMs = roundTripLatencyMs;
    }

    /**
     * Temporary JSON parser. In batch 5 this will be replaced with a real
     * JSON library. For now we simply return a hard coded instance so the
     * rest of the application can compile.
     */
    public static SpreadOpportunity fromJson(String json) {
        // placeholder values
        return new SpreadOpportunity(
                                     "BTC/USDT",
                                     "Binance",
                                     "Kraken",
                                     0.0,
                                     0.0,
                                     0.0,
                                     0L
                                 );
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

      public double getGrossEdge() {
          return grossEdge;
      }

      public double getNetEdge() {
          return netEdge;
      }

      public double getExpectedProfitUsd() {
          return expectedProfitUsd;
      }

      public long getLatencyMs() {
          return roundTripLatencyMs;
      }

      public long getRoundTripLatencyMs() {
          return roundTripLatencyMs;
      }
  }
