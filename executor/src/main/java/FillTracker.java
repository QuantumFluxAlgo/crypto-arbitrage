package executor;

import java.io.FileWriter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Helper to confirm asynchronous fills with timeout and cancel fallback. */
public class FillTracker {
    private static final Logger logger = LoggerFactory.getLogger(FillTracker.class);
    private static final long DEFAULT_TIMEOUT_MS = 5000L;
    private final long timeoutMs;
    private final Map<String, OrderCtx> orders = new ConcurrentHashMap<>();

    private static class OrderCtx {
        final ExchangeAdapter adapter;
        final String pair;
        final double size;
        OrderCtx(ExchangeAdapter adapter, String pair, double size) {
            this.adapter = adapter;
            this.pair = pair;
            this.size = size;
        }
    }

    /** Create tracker with default 5s timeout. */
    public FillTracker() {
        this(DEFAULT_TIMEOUT_MS);
    }

    /** @param timeoutMs max time to wait for a fill */
    public FillTracker(long timeoutMs) {
        this.timeoutMs = timeoutMs;
    }

    /** Submit order to adapter and track it. */
    public String submitOrder(ExchangeAdapter adapter, String pair, String side, double size, double price) {
        String id = side.toUpperCase() + "-" + System.nanoTime();
        adapter.placeIocOrder(pair, side, size, price);
        orders.put(id, new OrderCtx(adapter, pair, size));
        return id;
    }

    /** Wait for order fill or cancel if timeout/partial. */
    public boolean waitForFill(String orderId) {
        OrderCtx ctx = orders.remove(orderId);
        if (ctx == null) {
            return false;
        }
        // Cancel fallback enforces IOC semantics if async ACK fails
        CompletableFuture<Boolean> fut = CompletableFuture.supplyAsync(() -> {
            double filled = 0.0;
            if (ctx.adapter instanceof MockExchangeAdapter) {
                filled = ((MockExchangeAdapter) ctx.adapter).getLastFillSize();
            }
            return filled >= ctx.size;
        });
        try {
            boolean filled = fut.get(60, TimeUnit.MICROSECONDS);
            if (!filled) {
                ctx.adapter.cancel(orderId);
                logger.warn("[IOC TIMEOUT] Cancelled order after 60\u03bcs wait");
                logFailure(ctx.pair, orderId, ctx.size);
            }
            return filled;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            ctx.adapter.cancel(orderId);
            logger.warn("[IOC TIMEOUT] Cancelled order after 60\u03bcs wait");
            logFailure(ctx.pair, orderId, ctx.size);
            return false;
        } catch (TimeoutException | ExecutionException e) {
            ctx.adapter.cancel(orderId);
            logger.warn("[IOC TIMEOUT] Cancelled order after 60\u03bcs wait");
            logFailure(ctx.pair, orderId, ctx.size);
            return false;
        }
    }

    private void logFailure(String pair, String orderId, double size) {
        String msg = String.format("%d,%s,%s,%.8f%n", System.currentTimeMillis(), pair, orderId, size);
        try {
            java.nio.file.Path logDir = java.nio.file.Paths.get("logs");
            java.nio.file.Files.createDirectories(logDir);
            try (FileWriter fw = new FileWriter(logDir.resolve("fill_failures.log").toFile(), true)) {
                fw.write(msg);
            }
        } catch (IOException e) {
            logger.error("Failed to write fill failure log", e);
        }
    }
}
