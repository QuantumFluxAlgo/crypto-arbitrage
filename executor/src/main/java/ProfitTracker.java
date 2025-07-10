package executor;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProfitTracker {
    private static final Logger logger = LoggerFactory.getLogger(ProfitTracker.class);
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private static final int MAX_RETRIES = 3;
    private static double globalTotal = 0.0;
    private static double dailyTotal = 0.0;

    private static double startingBalance = 10_000.0;
    private static String analyticsUrl = "http://localhost:5000/trade";

    /**
     * Initialize the tracker with starting capital and analytics endpoint.
     *
     * @param startBalance initial account balance used for loss calculations
     * @param url analytics endpoint to send trade PnL data
     */
    public static void init(double startBalance, String url) {
        startingBalance = startBalance;
        analyticsUrl = url;
        logger.info("ProfitTracker initialized: startingBalance={}, analyticsUrl={}", startBalance, url);
    }

    /**
     * Record profit or loss from a trade.
     * Updates both the daily total and the global total.
     *
     * @param pnl profit (positive) or loss (negative)
     */
    public static void record(double pnl) {
        dailyTotal += pnl;
        globalTotal += pnl;
        sendWithRetry(pnl, 0);
    }

    private static void sendWithRetry(double pnl, int attempt) {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(analyticsUrl))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString("{\"pnl\":" + pnl + "}"))
            .build();

        httpClient.sendAsync(request, HttpResponse.BodyHandlers.discarding())
            .thenAccept(resp -> {
                if (resp.statusCode() >= 400) {
                    logger.warn("Failed to record trade: HTTP {}", resp.statusCode());
                    scheduleRetry(pnl, attempt + 1);
                }
            })
            .exceptionally(e -> {
                logger.error("Error sending trade to analytics", e);
                return null;
            });
    }

    
    private static void scheduleRetry(double pnl, int attempt) {
        if (attempt > MAX_RETRIES) {
            logger.error("Failed to record trade after {} attempts", attempt);
            return;
        }
        long delay = (long) Math.pow(2, attempt); // exponential backoff seconds
        scheduler.schedule(() -> sendWithRetry(pnl, attempt), delay, TimeUnit.SECONDS);
    }

    /**
     * Get today's loss as a percentage of the configured starting capital.
     *
     * @param pnl profit (positive) or loss (negative)
     */
    public static double getDailyLossPct() {
        if (dailyTotal >= 0) {
            return 0.0;
        }
        return (-dailyTotal / startingBalance) * 100.0;
    }

    /**
     * Get the global total profit recorded.
     *
     * @return global profit
     */
    public static double getGlobalTotal() {
        return globalTotal;
    }
    
    /**
     * Get the initial starting balance used for drawdown calculations.
     *
     * @return starting balance value
     */
    public static double getStartingBalance() {
        return startingBalance;
    }
}

