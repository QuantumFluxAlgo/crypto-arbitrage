package executor;

/**
 * Basic spread representation with an edge value and latency.
 */
public class Spread {
    private final double edge;
    private final long latencyMs;

    /**
     * @param edge      raw edge value
     * @param latencyMs measured latency in milliseconds
     */
    public Spread(double edge, long latencyMs) {
        this.edge = edge;
        this.latencyMs = latencyMs;
    }

    /**
     * @return edge value
     */
    public double getEdge() {
        return edge;
    }

    /**
     * @return latency in milliseconds
     */
    public long getLatencyMs() {
        return latencyMs;
    }
}
