# Prism Arbitrage API Reference

This document describes the active REST endpoints exposed by the `api/` service. All requests require a valid JWT in the `Authorization` header unless the route is flagged as sandbox-only.

---

## /login  `[All Modes]`

**Method:** `POST`

Authenticate with an email/password pair. Sandbox mode accepts demo credentials. Use `/login/token` to reuse an existing JWT.

**Payload**
```json
{ "email": "user@domain", "password": "secret" }
```

**Success Response**
```json
{ "token": "<jwt>" }
```

Invalid credentials return `401` and the attempt is logged with IP address and current mode.

---

## /login/token  `[All Modes]`

**Method:** `POST`

Accepts an existing JWT and sets the auth cookie.

**Payload**
```json
{ "token": "<jwt>" }
```

**Success Response**
```json
{ "token": "<jwt>" }
```

Bad tokens return `401` and are logged.

---

## /settings  `[All Modes]`

**GET** – Returns the current configuration object.

**Sample Response**
```json
{
  "schema_version": 1,
  "canary_mode": false,
  "useEnsemble": true,
  "shadowOnly": false,
  "ghost_mode": false,
  "sandbox_mode": true,
  "personality_mode": "Realistic",
  "sweep_cadence": "None",
  "maxLoss": 0,
  "maxLossPct": 0,
  "latencyMaxMs": 250,
  "coinExposureLimit": 10,
  "source": "redis"
}
```

**POST / PATCH** – Update one or more fields. Only the following keys are accepted:

```json
{
  "mode": "Aggressive",
  "lossCapPct": 8,
  "latencyMaxMs": 300,
  "coinExposureCap": 0.1,
  "sweepFrequency": "Daily"
}
```

Values outside safe limits return `400` and the override attempt is logged.
Successful updates return:
```json
{ "saved": true }
```

---

## /opportunities  `[All Modes]`

**Method:** `GET`

Returns live (or simulated) spread opportunities from Redis.

**Sample Response**
```json
{
  "opportunities": [],
  "executionMode": "DRY_RUN",
  "lastUpdated": "2025-07-23T10:22:11Z"
}
```

Data is simulated when running in `DRY_RUN` or `SANDBOX` modes.

---

## /test/panic  `[Sandbox Only]`

**Method:** `POST`

Triggers the panic brake for testing.

**Payload**
```json
{ "type": "loss", "value": 9 }
```

Only available in `DRY_RUN` or `SANDBOX` modes. Logs include timestamp, trigger type and request source.

**Success Response**
```json
{ "status": "panic_triggered", "mode": "DRY_RUN", "reason": "loss" }
```

---

## /resume  `[Live Restricted]`

**Method:** `POST`

Requires admin privileges. Clears the panic state and resumes trading.

**Payload**
```json
{ "confirm": true }
```

In live mode the `confirm` flag is mandatory. On success:
```json
{ "status": "resumed", "confirmed": true, "mode": "live" }
```

The dashboard polls `/system/status` until `paused` becomes `false`.

---

## /test/resume  `[Sandbox Only]`

**Method:** `POST`

Convenience endpoint for tests. Resumes trading without admin auth.

**Success Response**
```json
{ "paused": false, "source": "manual" }
```

---

## /test/sweep  `[Sandbox Only]`

**Method:** `POST`

Simulates a cold wallet sweep. In live mode this route is disabled.

**Success Response**
```json
{
  "status": "dry-run-complete",
  "triggered": true,
  "actions": ["sweep-from:Binance", "amount:12.5 USDT"]
}
```

---

## /system/status  `[All Modes]`

**Method:** `GET`

Reports the current pause state.

**Sample Response**
```json
{
  "paused": false,
  "panic_reason": null,
  "resume_failed": false
}
```

---

Prometheus scrapes `/metrics` for service monitoring. This endpoint is not intended for operators.

