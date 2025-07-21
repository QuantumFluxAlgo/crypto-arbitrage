# Operator UI

The dashboard displays a persistent banner at the top of every page indicating the current execution mode and whether the panic brake is active.

| Color | Text |
|-------|------|
| Green | `✅ Live - Trading Active` |
| Red   | `🔴 Panic Mode - Trading Halted` |
| Orange| `🧪 Sandbox Mode - Simulation Running` |
| Dark Red | `🔒 Sandbox Panic - Simulating Failure State` |

Use the banner to verify that trading has resumed after an incident or that sandbox simulations are running as expected. Mode changes are published on `control-feed-live` and `control-feed-sandbox` so the banner updates instantly.
