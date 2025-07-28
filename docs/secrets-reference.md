# Secrets Reference

Local deployments use an unsealed Kubernetes secret named `prod-secrets`. The file `prod-secret.yaml` contains placeholder values and should never be committed with real credentials.

Example contents:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: prod-secrets
  namespace: default
type: Opaque
stringData:
  BINANCE_KEY: dummy-key
  BINANCE_SECRET: dummy-secret
  SMTP_USER: user@example.com
  SMTP_PASS: pass123
  JWT_SECRET: changeme
  WALLET_ADDRESS: test-wallet
```

Apply it before deploying the chart:

```bash
kubectl apply -f prod-secret.yaml
```

For production, seal the secret with `kubeseal` and commit the resulting `sealed-secret.yaml` instead. The sandbox `.env.sandbox` file holds matching dummy tokens for the API and dashboard.
