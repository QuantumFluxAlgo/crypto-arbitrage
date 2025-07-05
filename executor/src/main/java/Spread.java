package executor;

public class Spread {
    private final double edge;
    private final long latencyMs;

    public Spread(double edge, long latencyMs) {
        this.edge = edge;
        this.latencyMs = latencyMs;
    }

    public double getEdge() {
        return edge;
    }

    public long getLatencyMs() {
        return latencyMs;
    }
}
