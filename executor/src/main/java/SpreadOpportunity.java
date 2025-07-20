package executor;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Represents an executable arbitrage opportunity between two exchanges.
 */
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

    /**
     * Factory method for creating exchange adapters. Allows tests to override
     * with custom behaviour.
     */
    protected MockExchangeAdapter createAdapter(String name) {
        return new MockExchangeAdapter(name);
    }

    /**
     * Create an opportunity with the given parameters.
     */
    public SpreadOpportunity(String pair,
                             String buyExchange,
                             String sellExchange,
                             double grossEdge,
                             double netEdge,
                             long latencyMs) {
        this.pair = pair;
        this.buyExchange = buyExchange;
        this.sellExchange = sellExchange;
        this.grossEdge = grossEdge;
        this.netEdge = netEdge;
        this.latencyMs = latencyMs;
        this.roundTripLatencyMs = latencyMs;
        this.latencyMicros = latencyMs * 1000;
        this.roundTripLatencyMicros = latencyMs * 1000;
    }

    /**
     * Parse an opportunity from a JSON payload.
     */
    public static SpreadOpportunity fromJson(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(json);
            long latency = node.has("latencyMs") ? node.get("latencyMs").asLong() : 0L;
            return new SpreadOpportunity(
                node.get("pair").asText(),
                node.get("buyExchange").asText(),
                node.get("sellExchange").asText(),
                node.get("grossEdge").asDouble(),
                node.get("netEdge").asDouble(),
                latency
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
            spread.getEdge(),
            spread.getLatencyMs()
        );
        opp.roundTripLatencyMs = spread.getLatencyMs();
        opp.latencyMicros = spread.getLatencyMs() * 1000;
        opp.roundTripLatencyMicros = spread.getLatencyMs() * 1000;
        return opp;
    }

    /**
     * Execute the opportunity using mock exchanges.
     */
    public TradeResult execute(double size, double price) {
        MockExchangeAdapter buy = createAdapter(buyExchange);
        MockExchangeAdapter sell = createAdapter(sellExchange);

        String buyOrderId = "BUY-" + System.nanoTime();
        String sellOrderId = "SELL-" + System.nanoTime();

        long start = System.nanoTime();

        double buyCancel = 0.0;
        double sellCancel = 0.0;
        boolean buyOk = false;
        boolean sellOk = false;
        int attempts = 0;
        final int maxRetries = 3;

        while (attempts < maxRetries && !buyOk) {
            buyOk = buy.placeIocOrder(pair, "BUY", size, price);
            buyCancel += buy.getLastCancelFee();
            if (!buyOk && buy.getLastFillSize() > 0) {
                sell.cancel(sellOrderId);
                logger.info("[CANCEL] Orphan order canceled: {}", sellOrderId);
                break;
            }
            attempts++;
        }

        if (buyOk) {
            attempts = 0;
            while (attempts < maxRetries && !sellOk) {
                sellOk = sell.placeIocOrder(pair, "SELL", size, price);
                sellCancel += sell.getLastCancelFee();
                if (!sellOk && sell.getLastFillSize() > 0) {
                    buy.cancel(buyOrderId);
                    logger.info("[CANCEL] Orphan order canceled: {}", buyOrderId);
                    break;
                }
                attempts++;
            }
        }

        long end = System.nanoTime();

        latencyMicros = (end - start) / 1000;
        roundTripLatencyMicros = latencyMicros;
        latencyMs = latencyMicros / 1000;
        roundTripLatencyMs = latencyMs;

        double buyFee = size * price * buy.getFeeRate(pair);
        double sellFee = size * price * sell.getFeeRate(pair);
        double pnl = netEdge - buyFee - sellFee - buyCancel - sellCancel;
        boolean success = buyOk && sellOk;

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

    @Override
    public String toString() {
        return "SpreadOpportunity{" +
                "pair='" + pair + '\'' +
                ", buyExchange='" + buyExchange + '\'' +
                ", sellExchange='" + sellExchange + '\'' +
                ", grossEdge=" + grossEdge +
                ", netEdge=" + netEdge +
                ", latencyMs=" + latencyMs +
                '}';
    }
}

