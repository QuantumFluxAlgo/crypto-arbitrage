# Panic Brake Resume Behavior

When the system enters panic mode, trading halts until a resume request is issued. A red banner appears across the operator dashboard to make the state obvious.
To prevent unsafe restarts, the resume action now verifies several health checks:

1. **Heartbeat Alive** – ensures internal monitoring threads are responsive.
2. **Cold Sweeper Idle** – avoids conflicts with ongoing cold wallet transfers.
3. **Panic State Cleared** – confirms alerts and flags have been reset.

If any check fails, the resume endpoint responds with HTTP `503` and the dashboard disables the **Resume Trading** button. Operators should inspect the logs for the specific reason before retrying.

Redis publishes the resume event to either `control-feed-live` or `control-feed-sandbox` depending on the current mode. The executor listens to the correct channel and will not restart if the message arrives on the wrong one.

In live operation the `/resume` API requires an authenticated admin JWT. Sandbox mode leaves the endpoint open so QA environments can easily toggle panic states.
