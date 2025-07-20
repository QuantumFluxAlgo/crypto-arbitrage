# Panic Brake Resume Behavior

When the system enters panic mode, trading halts until a resume request is issued.
To prevent unsafe restarts, the resume action now verifies several health checks:

1. **Heartbeat Alive** – ensures internal monitoring threads are responsive.
2. **Cold Sweeper Idle** – avoids conflicts with ongoing cold wallet transfers.
3. **Panic State Cleared** – confirms alerts and flags have been reset.

If any check fails, the resume endpoint responds with HTTP `503` and the dashboard
will disable the **Resume Trading** button. Operators should inspect the logs for
the specific reason before retrying.
