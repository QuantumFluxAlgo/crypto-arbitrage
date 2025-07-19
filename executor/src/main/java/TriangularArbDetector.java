package executor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

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
    private final Map<String, Set<String>> adjacency = new HashMap<>();
    private final Executor executor;
    private final ObjectMapper mapper = new ObjectMapper();
    private final double feeRate = 0.001;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final long intervalMs;
    private final AtomicBoolean dirty = new AtomicBoolean(false);

    /**
     * @param executor executor to notify when opportunities arise
     */
    public TriangularArbDetector(Executor executor) {
        this(executor, getIntervalMs());
    }

    /**
     * @param executor    executor to notify
     * @param intervalMs  minimum milliseconds between scans (0 for immediate)
     */
    public TriangularArbDetector(Executor executor, long intervalMs) {
        this.executor = executor;
        this.intervalMs = intervalMs > 0 ? intervalMs : 0;
        if (this.intervalMs > 0) {
            scheduler.scheduleAtFixedRate(() -> {
                if (dirty.getAndSet(false)) {
                    scan();
                }
            }, this.intervalMs, this.intervalMs, TimeUnit.MILLISECONDS);
        }
    }

    static long getIntervalMs() {
        String val = System.getProperty("ARB_SCAN_MS",
                System.getenv().getOrDefault("ARB_SCAN_MS", "100"));
        try {
            return Long.parseLong(val);
        } catch (NumberFormatException e) {
            return 100L;
        }
    }

    /**
     * Validate that bid/ask values appear sane. This helps catch
     * obviously incorrect feed data which could indicate fraudulent
     * manipulation or feed errors.
     */
    private boolean validBook(double bid, double ask) {
        if (bid <= 0 || ask <= 0) return false;
        if (bid >= ask) {
            logger.warn("Order book bid {} >= ask {} - possible fraud", bid, ask);
            return false;
        }
        return true;
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
        if (!validBook(bestBid, bestAsk)) {
            return;
        }
        books.put(pair, new OrderBook(bestBid, bestAsk));
        String[] parts = split(pair);
        if (parts != null) {
            adjacency.computeIfAbsent(parts[0], k -> new HashSet<>()).add(pair);
        }
        dirty.set(true);
        if (intervalMs == 0) {
            scan();
            dirty.set(false);
        }
    }

    private void scan() {
        double bestEdge = 0.0;
        String bestMessage = null;

        for (Map.Entry<String, OrderBook> entry1 : books.entrySet()) {
            String pair1 = entry1.getKey();
            OrderBook first = entry1.getValue();
            String[] t1 = split(pair1);
            if (t1 == null) continue;

            Set<String> secondPairs = adjacency.getOrDefault(t1[1], Set.of());
            for (String pair2 : secondPairs) {
                if (pair2.equals(pair1)) continue;
                OrderBook ob2 = books.get(pair2);
                if (ob2 == null) continue;
                String[] t2 = split(pair2);
                if (t2 == null) continue;

                String pair3 = t2[1] + "/" + t1[0];
                OrderBook b3 = books.get(pair3);
                if (b3 == null) continue;

                double product = (1.0 / first.getAsk()) * (1 - feeRate)
                        * ob2.getBid() * (1 - feeRate)
                        * b3.getBid() * (1 - feeRate);
                double grossEdge = product - 1.0;
                if (grossEdge > 0) {
                    double netEdge = grossEdge - (3 * feeRate);
                    if (netEdge > bestEdge) {
                        bestEdge = netEdge;
                        String path = t1[0] + "-" + t1[1] + "-" + t2[1];
                        ObjectNode node = mapper.createObjectNode();
                        node.put("pair", path);
                        node.put("buyExchange", "triangular");
                        node.put("sellExchange", "triangular");
                        node.put("grossEdge", grossEdge);
                        node.put("netEdge", netEdge);
                        bestMessage = node.toString();
                    }
                }
            }
        }

        if (bestMessage != null) {
            logger.info("Triangular arbitrage detected: {}", bestMessage);
            executor.handleMessage(bestMessage);
        }
    }

    private String[] split(String pair) {
        if (pair == null) return null;
        String[] parts = pair.split("/");
        return parts.length == 2 ? parts : null;
    }

    /** Stop the scheduled scans. */
    public void stop() {
        scheduler.shutdownNow();
    }
}
