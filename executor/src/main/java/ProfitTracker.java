import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ProfitTracker {
    private static final Logger logger = LoggerFactory.getLogger(ProfitTracker.class);
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
        try {
            URL url = new URL(analyticsUrl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            String json = "{\"pnl\":" + pnl + "}";
            try (OutputStream os = conn.getOutputStream()) {
                os.write(json.getBytes(StandardCharsets.UTF_8));
            }
            int code = conn.getResponseCode();
            if (code >= 400) {
                logger.warn("Failed to record trade: HTTP {}", code);
            }
            conn.disconnect();
        } catch (Exception e) {
            logger.error("Error sending trade to analytics", e);
        }
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
}

