# Telegram Alert Setup

This guide explains how to configure Telegram alerts for Prism Arbitrage. Alerts are sent through the Telegram Bot API and optionally via SMTP in parallel. Messages are triggered asynchronously and will not block core trading logic.

## 1. Create and Configure a Telegram Bot

1. Open [@BotFather](https://t.me/botfather) in Telegram.
2. Send `/newbot` and follow the prompts to name the bot.
3. Copy the token shown (example: `123456789:ABCDEF-...`).
4. From your operator account, open a chat with the bot and send `/start`.

## 2. Get Your Telegram Chat ID

1. Send any message to the bot from the desired user or group.
2. Visit `https://api.telegram.org/bot<YourToken>/getUpdates` in your browser.
3. The JSON response includes your chat ID:
   ```json
   { "chat": { "id": 123456789, "type": "private" } }
   ```

## 3. Configure Environment Variables in `.env`

Add the following to `api/.env` (or your deployment secret):
```env
# Required for Telegram alerts
TELEGRAM_BOT_TOKEN=123456789:ABCDEF...
TELEGRAM_CHAT_ID=123456789

# Optional: enable or disable Telegram integration
TELEGRAM_ENABLED=true
```

## 4. Supported Alert Events

Telegram notifications fire on these events:

- `panic_triggered`
- `resume_triggered`
- `sweep_triggered` (live only)
- `settings_override_attempt`
- `loss_cap_breached`
- `latency_ceiling_exceeded`

Each message includes the current mode (`dry-run-sandbox`, `dry-run-server`, or `live`), a timestamp, and the reason for the alert.

## 5. Testing Alerts

Run the API locally and trigger test endpoints:

```bash
curl -X POST http://localhost:8080/api/test/panic
```
Expected Telegram message:
```yaml
🚨 PANIC TRIGGERED
Mode: dry-run-server
Reason: Simulated 9% loss
Timestamp: 2025-07-23T17:41:12Z
```

Resume example:
```bash
curl -X POST http://localhost:8080/api/test/resume -H "Content-Type: application/json" -d '{"confirm": true}'
```
Expected message:
```pgsql
✅ RESUME COMMAND ISSUED
Mode: dry-run-server
Operator: dashboard-admin
System status: resumed
```

Alerts use non-blocking logic, so trading continues unaffected by slow networks. SMTP and other channels can be enabled in parallel if desired.
