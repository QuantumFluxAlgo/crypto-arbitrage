package executor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Represents an executable arbitrage opportunity between two exchanges. */
public class SpreadOpportunity {
  private static final Logger logger = LoggerFactory.getLogger(SpreadOpportunity.class);
  private final String pair;
  private final String buyExchange;
  private final String sellExchange;
  private final double grossEdge;
  private final double netEdge;
  private long latencyMs;
  private long roundTripLatencyMs;
  private long latencyMicros;
  private long roundTripLatencyMicros;
  private long timestamp;

  /**
   * Factory method for creating exchange adapters. Allows tests to override with custom behaviour.
   */
  protected MockExchangeAdapter createAdapter(String name) {
    return new MockExchangeAdapter(name);
  }

  /** Create an opportunity with the given parameters. */
  public SpreadOpportunity(
      String pair,
      String buyExchange,
      String sellExchange,
      double grossEdge,
      double netEdge,
      long latencyMs) {
    this(pair, buyExchange, sellExchange, grossEdge, netEdge, latencyMs,
        System.currentTimeMillis());
  }

  public SpreadOpportunity(
      String pair,
      String buyExchange,
      String sellExchange,
      double grossEdge,
      double netEdge,
      long latencyMs,
      long timestamp) {
    this.pair = pair;
    this.buyExchange = buyExchange;
    this.sellExchange = sellExchange;
    this.grossEdge = grossEdge;
    this.netEdge = netEdge;
    this.latencyMs = latencyMs;
    this.roundTripLatencyMs = latencyMs;
    this.latencyMicros = latencyMs * 1000;
    this.roundTripLatencyMicros = latencyMs * 1000;
    this.timestamp = timestamp;
  }

  /** Parse an opportunity from a JSON payload. */
  public static SpreadOpportunity fromJson(String json) {
    try {
      ObjectMapper mapper = new ObjectMapper();
      JsonNode node = mapper.readTree(json);
      long latency = node.has("latencyMs") ? node.get("latencyMs").asLong() : 0L;
      long ts = node.has("timestamp") ? node.get("timestamp").asLong()
                                        : System.currentTimeMillis();
      return new SpreadOpportunity(
          node.get("pair").asText(),
          node.get("buyExchange").asText(),
          node.get("sellExchange").asText(),
          node.get("grossEdge").asDouble(),
          node.get("netEdge").asDouble(),
          latency,
          ts);
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid opportunity JSON", e);
    }
  }

  /** Convert a simple spread into a SpreadOpportunity instance. */
  public static SpreadOpportunity fromSpread(Spread spread) {
    SpreadOpportunity opp =
        new SpreadOpportunity(
            "",
            "",
            "",
            spread.getEdge(),
            spread.getEdge(),
            spread.getLatencyMs(),
            System.currentTimeMillis());
    opp.roundTripLatencyMs = spread.getLatencyMs();
    opp.latencyMicros = spread.getLatencyMs() * 1000;
    opp.roundTripLatencyMicros = spread.getLatencyMs() * 1000;
    return opp;
  }

  /** Execute the opportunity using mock exchanges. */
  public TradeResult execute(double size, double price) {
    MockExchangeAdapter buy = createAdapter(buyExchange);
    MockExchangeAdapter sell = createAdapter(sellExchange);

    FillTracker tracker = new FillTracker();

    String buyOrderId = tracker.submitOrder(buy, pair, "BUY", size, price);
    String sellOrderId = tracker.submitOrder(sell, pair, "SELL", size, price);

    long start = System.nanoTime();

    double buyCancel = buy.getLastCancelFee();
    double sellCancel = sell.getLastCancelFee();

    boolean buyOk = tracker.waitForFill(buyOrderId);
    boolean sellOk = tracker.waitForFill(sellOrderId);

    boolean partial = !(buyOk && sellOk);

    if (partial) {
      logger.info(
          "[CANCEL] Partial fill detected. Canceling outstanding legs: {}, {}",
          buyOrderId,
          sellOrderId);
    }

    long end = System.nanoTime();

    latencyMicros = (end - start) / 1000;
    roundTripLatencyMicros = latencyMicros;
    latencyMs = latencyMicros / 1000;
    roundTripLatencyMs = latencyMs;

    double buyFee = size * price * buy.getFeeRate(pair);
    double sellFee = size * price * sell.getFeeRate(pair);
    double pnl = netEdge - buyFee - sellFee - buyCancel - sellCancel;
    boolean success = !partial && buyOk && sellOk;
    String status = partial ? "PARTIAL_ABORTED" : (success ? "FILLED" : "FAILED");

    return new TradeResult(success, success ? pnl : 0.0, latencyMs, status);
  }

  /**
   * @return trading pair
   */
  public String getPair() {
    return pair;
  }

  /**
   * @return buy exchange name
   */
  public String getBuyExchange() {
    return buyExchange;
  }

  /**
   * @return sell exchange name
   */
  public String getSellExchange() {
    return sellExchange;
  }

  /**
   * @return gross edge value
   */
  public double getGrossEdge() {
    return grossEdge;
  }

  /**
   * @return net edge value
   */
  public double getNetEdge() {
    return netEdge;
  }

  /**
   * @return measured latency in ms
   */
  public long getLatencyMs() {
    return latencyMs;
  }

  /**
   * @return round trip latency in ms
   */
  public long getRoundTripLatencyMs() {
    return roundTripLatencyMs;
  }

  /**
   * @return latency in microseconds
   */
  public long getLatencyMicros() {
    return latencyMicros;
  }

  /**
   * @return round trip latency in microseconds
   */
  public long getRoundTripLatencyMicros() {
    return roundTripLatencyMicros;
  }

  /**
   * @return creation timestamp of the opportunity
   */
  public long getTimestamp() {
    return timestamp;
  }

  @Override
  public String toString() {
    return "SpreadOpportunity{"
        + "pair='"
        + pair
        + '\''
        + ", buyExchange='"
        + buyExchange
        + '\''
        + ", sellExchange='"
        + sellExchange
        + '\''
        + ", grossEdge="
        + grossEdge
        + ", netEdge="
        + netEdge
        + ", latencyMs="
        + latencyMs
        + ", timestamp="
        + timestamp
        + '}';
  }
}
