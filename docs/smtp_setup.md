# SMTP Alert Setup

This guide configures email alerts through Gmail. Use an application password and store it securely via SealedSecrets.

## Steps

1. Create a Gmail app password for your account.
2. Copy `api/.env.example` to `api/.env` and set:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=<your address>
   SMTP_PASS=<app password>
   ALERT_RECIPIENT=<destination address>
   ```
3. Seal the secret before committing:
   ```bash
   kubectl create secret generic smtp-creds \
     --from-env-file=api/.env \
     --dry-run=client -o yaml > secret.yaml
   kubeseal < secret.yaml > sealed-smtp.yaml
   rm secret.yaml
   ```
4. Apply the sealed secret during deployment:
   ```bash
   kubectl apply -f sealed-smtp.yaml
   ```

## Test the Alert

Trigger a test alert once the API is running:
```bash
curl -X POST http://localhost:8080/api/test/panic
```
⚠️ **The `/api/test/panic` endpoint only functions in dry-run mode.**

Check the logs for `Sending panic alert` and confirm the email arrived.
