package safety;

public class PanicBrake {
    private final double maxDailyLossPct;
    private final double maxLatencyMs;
    private final double minWinRate;

    public static final PanicBrake DEFAULT = new PanicBrake(3.0, 500.0, 0.4);

    public PanicBrake(double maxDailyLossPct, double maxLatencyMs, double minWinRate) {
        this.maxDailyLossPct = maxDailyLossPct;
        this.maxLatencyMs = maxLatencyMs;
        this.minWinRate = minWinRate;
    }

    public boolean shouldHalt(double lossPctToday, double avgLatency, double winRate) {
        if (lossPctToday > maxDailyLossPct) {
            System.out.println("Panic brake triggered: daily loss limit exceeded");
            return true;
        }
        if (avgLatency > maxLatencyMs) {
            System.out.println("Panic brake triggered: latency limit exceeded");
            return true;
        }
        if (winRate < minWinRate) {
            System.out.println("Panic brake triggered: win rate below minimum");
            return true;
        }
        return false;
    }

    public static boolean shouldHalt(float dailyLossPct, float avgLatencyMs, float winRate) {
        return DEFAULT.shouldHalt(dailyLossPct, avgLatencyMs, winRate);
    }
}

