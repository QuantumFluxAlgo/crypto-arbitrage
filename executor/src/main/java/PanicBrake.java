public class PanicBrake {
    private double maxDailyLossPct;
    private double maxLatencyMs;
    private double minWinRate;

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
}
