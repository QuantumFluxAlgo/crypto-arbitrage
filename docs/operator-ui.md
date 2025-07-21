# Operator Dashboard

The dashboard provides real‑time visibility and control. After logging in, a banner across the top indicates the current execution mode and whether the panic brake is active.

| Color     | Meaning                                    |
|-----------|--------------------------------------------|
| **Green** | ✅ Live – trading active                   |
| **Red**   | 🔴 Panic Mode – trading halted             |
| **Orange**| 🧪 Sandbox – simulation running            |
| **Dark Red** | 🔒 Sandbox Panic – simulated failure    |

The banner updates automatically by polling `/api/system/status` every 30 seconds and by listening for messages on the relevant Redis control channel.

## Resume Button

When the system is in panic mode a **Resume Trading** button appears. Pressing it sends a POST to `/api/resume`. In live mode the request must include an admin JWT token. If the API returns `503` the UI disables the button and displays a tooltip instructing the operator to check logs.

## Example Workflow

1. Observe the banner turn red after a risk breach.
2. Inspect metrics and logs from Grafana and the executor pod.
3. Once resolved, click **Resume Trading** (or run `curl` as shown in [panic-brake.md](panic-brake.md)).
4. The banner switches back to green (live) or orange (sandbox) indicating normal operation.

Use the banner and button together to safely control trading without shell access to the server.
