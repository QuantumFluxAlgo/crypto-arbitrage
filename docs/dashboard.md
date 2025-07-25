# Prism Arbitrage Operator Dashboard

The dashboard is a mobile‑friendly React single‑page app served from the `/api/` service. Operators use it to monitor health metrics and control trading through the backend APIs and Redis pub/sub.

![Dashboard Overview](../dashboard/docs/images/dashboard.png)

## Login Flow

1. Browse to the dashboard URL and you will be redirected to **/login**.
2. Enter your email and password. The form posts to `/api/login` and the API returns a JWT which is stored in a secure cookie.
3. In sandbox mode use the same test account `admin@prism.one` with password `test123` as shown in the [login route](/api/routes/login.js).
4. After a successful login the token is also stored in `localStorage` to keep you logged in across refreshes.
5. If the token becomes invalid the next API call returns HTTP `401` and the app routes back to `/login`.

```
POST /api/login
```

## Live Status Display

The banner component polls `/api/system/status` every 30 seconds to update the UI. It reflects:

 - **Execution Mode** – `LIVE`, `SANDBOX` or `DRY_RUN`.
- **Panic State** – paused or active.
- **Win rate, NAV, latency and cold wallet ratio** from the metrics feed.

Color reference:

| Color            | Meaning                                  |
|------------------|------------------------------------------|
| **Green**        | Trading active (live)                    |
| **Orange**       | Dry-run mode                             |
| **Red**          | Panic brake engaged                      |
| **Dark Red**     | Sandbox panic simulation                 |

## Resume Trading

When the system is paused a **Resume Trading** button appears. The process is:

1. Click the button and confirm the modal dialog.
2. The dashboard sends `POST /api/test/resume` (see [resume route](/api/routes/resume.js)) and waits for a response.
3. The UI polls `/api/system/status` once to verify the executor cleared the panic flag.
4. If `paused` is still true the banner `Resume failed` is shown for 10 seconds.

Only dry‑run modes allow this endpoint. In live mode an admin JWT and `confirm=true` are required when risk limits were breached.

## Trigger Panic

Manual halts can be triggered in dry‑run modes using the **Pause Trading** button. The button posts to `/api/test/panic` which sets the pause state in Redis as shown in [panic route](/api/routes/panic.js) lines 7‑59.

A red banner appears immediately and the executor stops evaluating trades until resumed.

## Settings Panel

Available controls:

- **Personality Mode** – Auto, Realistic or Aggressive.
- **Coin Exposure Cap** – maximum number of concurrent assets.
- **Loss Cap %** – daily loss threshold.
- **Latency Max (ms)** – maximum allowed round trip latency.
- **Cold Wallet Sweep Cadence** – Daily, Monthly or None.

The dashboard PATCHes `/api/settings` with only the changed values. The backend validates every field (see [settings.js](/api/routes/settings.js) lines 55‑99). Invalid input returns `400` and the UI shows an error toast. Rejected values are also logged in `config_reject.log` by the `ConfigManager`.

## Mobile Behavior

- Works in Safari and Chrome on iOS and Android.
- Buttons and sliders are responsive in portrait orientation.
- The navigation menu collapses into a hamburger icon on narrow screens.

## Monitoring & Metrics

A Grafana frame can optionally be embedded within the dashboard. Metrics are served from `/api/metrics` and include executor latency, NAV, win rate and wallet ratios. System health checks can be viewed via `/api/system/health`.

## Operator Guidance

1. Always investigate alerts before resuming trading.
2. Verify the status banner turns green or orange after resuming.
3. Use the settings panel to adjust risk limits gradually—values exceeding limits are rejected by the API.
4. Keep the dashboard open during trading sessions to monitor latency and capital usage in real time.
