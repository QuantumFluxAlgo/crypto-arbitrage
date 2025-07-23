# compliance_uk.md

## Cold Wallet Sweep Logic
Prism triggers a cold wallet sweep automatically when **either** of the following thresholds is met:

- Transfer amount is **£5,000** or greater
- Amount represents **30% or more of NAV** (configurable from the dashboard)

Sweep cadence can be set to **Daily**, **Monthly**, or **None**. A sweep runs only when all of the following are true:

- `WALLET_ADDRESS` is defined
- The system is not paused

Sweeps never occur in dry-run mode. Instead, the log shows:

```csharp
[DRY-RUN MODE] Cold wallet sweep logic verified. No assets moved.
```

## Audit Trails
- Each executed order writes an entry in the trade log.
- Panic and resume actions include:
  - Timestamp
  - Operator ID (or IP if unavailable)
  - Execution mode
  - Reason: loss cap, latency, or manual
- Logs are written under `/var/log/prism/` and can be mirrored to an external store.

## CGT (Capital Gains Tax) Considerations
- Trade ledger tracks timestamp, amount, coin, and venue for every fill.
- Ledger resides in Postgres and supports HMRC pooling methods.
- Data can be exported for third‑party CGT software.

## AML Controls
- Platform assumes institutional wallets; no end‑user custody.
- Cold wallet address must be pre‑approved and is managed externally.
- Manual overrides of wallet rules are logged.
- Telegram and email alerts notify on:
  - Suspicious loss rate
  - Unauthorized resume attempts
  - Live-mode sweep triggers

Operational controls enforce panic brakes and sweep rules before each trade. Dry-run mode is for testing only and cannot move assets. All alerts are stored in logs and can be forwarded via SMTP or Telegram.
