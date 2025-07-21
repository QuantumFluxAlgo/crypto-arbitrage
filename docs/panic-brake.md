# Panic Brake and Safe Resume

The panic brake stops all trading when risk limits are breached. A red banner across the dashboard and the `/api/system/status` endpoint both indicate the active panic state.

## Triggering Conditions

- Daily loss exceeds the configured percentage
- Average latency rises above the set maximum
- Win rate drops below the minimum threshold

When triggered, the executor publishes a `halt` message on `control-feed-live` or `control-feed-sandbox` based on its execution mode.

## Resume Procedure

1. Investigate logs and metrics to confirm the issue is resolved.
2. Send a POST request to `/api/resume` using an admin JWT when running in live mode.
   ```bash
   curl -H "Authorization: Bearer $ADMIN_TOKEN" -X POST \
     http://localhost:8080/api/resume
   ```
   Sandbox mode does not require authentication.
3. The API verifies:
   - Heartbeat threads are responsive
   - The cold sweeper is not transferring funds
   - Panic flags have been cleared
4. If any check fails the endpoint returns `503` and the Resume button becomes disabled. Review logs for `[RESUME-BLOCKED]` entries.
5. On success the API publishes `resume` to the appropriate control channel. The executor only resumes if the message matches its current mode.

Use the dashboard banner to confirm trading has restarted. If the banner stays red, repeat the checks above and resend the request once conditions are safe.
