# Telegram Alert Setup

Use a Telegram bot to receive panic and resume notifications.

## Steps

1. Create a new bot with [@BotFather](https://t.me/botfather) and copy the token.
2. Obtain your chat ID by messaging the bot and visiting:
   ```bash
   curl https://api.telegram.org/bot<token>/getUpdates
   ```
3. Set the following in `api/.env`:
   ```env
   TELEGRAM_TOKEN=<bot token>
   TELEGRAM_CHAT_ID=<chat id>
   ```
4. Seal the values as a secret:
   ```bash
   kubectl create secret generic telegram-creds \
     --from-env-file=api/.env \
     --dry-run=client -o yaml > tg.yaml
   kubeseal < tg.yaml > sealed-telegram.yaml
   rm tg.yaml
   kubectl apply -f sealed-telegram.yaml
   ```

## Send a Test Message

Run the API locally and trigger an alert:
```bash
curl -X POST http://localhost:8080/api/test/panic
```
⚠️ **Test endpoints are disabled in production mode.**

Check Telegram for the "Trading Paused" notification.
