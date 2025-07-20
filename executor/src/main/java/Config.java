package executor;

/** Configuration object supplying runtime execution mode. */
public class Config {
    private final ExecutionMode executionMode;

    public Config(ExecutionMode mode) {
        this.executionMode = mode;
    }

    public ExecutionMode getExecutionMode() {
        return executionMode;
    }

    /**
     * @return true when running in sandbox/dry-run mode
     */
    public boolean isDryRun() {
        return executionMode == ExecutionMode.SANDBOX;
    }
}
