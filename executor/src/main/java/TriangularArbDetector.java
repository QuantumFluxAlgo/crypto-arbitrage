package executor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Detects triangular arbitrage opportunities from order books and
 * forwards them to {@link Executor#handleMessage(String)}.
 */
public class TriangularArbDetector {
    private static final Logger logger = LoggerFactory.getLogger(TriangularArbDetector.class);

    /** Simple order book with best bid and ask. */
    static class OrderBook {
        final double bid;
        final double ask;
        OrderBook(double bid, double ask) {
            this.bid = bid;
            this.ask = ask;
        }
        double getBid() { return bid; }
        double getAsk() { return ask; }
    }

    private final Map<String, OrderBook> books = new HashMap<>();
    private final Executor executor;
    private final ObjectMapper mapper = new ObjectMapper();

    public TriangularArbDetector(Executor executor) {
        this.executor = executor;
    }

    /**
     * Update the order book for a trading pair.
     * When all three legs of a loop are present, potential arbitrage
     * opportunities are evaluated.
     *
     * @param pair pair identifier in the form BASE/QUOTE
     * @param bestBid highest bid price
     * @param bestAsk lowest ask price
     */
    public synchronized void update(String pair, double bestBid, double bestAsk) {
        books.put(pair, new OrderBook(bestBid, bestAsk));
        scan();
    }

    private void scan() {
        for (Map.Entry<String, OrderBook> e1 : books.entrySet()) {
            String[] t1 = split(e1.getKey());
            if (t1 == null) continue;
            for (Map.Entry<String, OrderBook> e2 : books.entrySet()) {
                if (e1.getKey().equals(e2.getKey())) continue;
                String[] t2 = split(e2.getKey());
                if (t2 == null || !t1[1].equals(t2[0])) continue;

                String pair3 = t2[1] + "/" + t1[0];
                OrderBook b3 = books.get(pair3);
                if (b3 == null) continue;

                double product = e1.getValue().getBid() * e2.getValue().getBid() * b3.getBid();
                if (product > 1.0) {
                    double edge = product - 1.0;
                    String path = t1[0] + "-" + t1[1] + "-" + t2[1];
                    ObjectNode node = mapper.createObjectNode();
                    node.put("pair", path);
                    node.put("buyExchange", "triangular");
                    node.put("sellExchange", "triangular");
                    node.put("grossEdge", edge);
                    node.put("netEdge", edge);
                    String msg = node.toString();
                    logger.debug("Triangular arbitrage detected: {}", msg);
                    executor.handleMessage(msg);
                }
            }
        }
    }

    private String[] split(String pair) {
        if (pair == null) return null;
        String[] parts = pair.split("/");
        return parts.length == 2 ? parts : null;
    }
}
