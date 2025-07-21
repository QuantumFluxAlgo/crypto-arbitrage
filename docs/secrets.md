# Secrets Management

All production credentials are stored as Kubernetes SealedSecrets. Plain `.env` files are forbidden in the repository and the CI workflow fails if any are detected.

## 1. Install `kubeseal`

```bash
brew install kubeseal
```

## 2. Create a base secret

Generate a normal Kubernetes secret from your environment file:

```bash
kubectl create secret generic api-keys \
  --from-env-file=.env \
  --dry-run=client -o yaml > secret.yaml
```

## 3. Seal the secret

Encrypt the manifest so it is safe to commit:

```bash
kubeseal < secret.yaml > sealed-secret.yaml
```

## 4. Commit and deploy

```bash
git add sealed-secret.yaml
kubectl apply -f sealed-secret.yaml
```

The `test/verify-env.sh` script ensures no raw secrets or `.env.sandbox` files slip into version control. Run it locally before pushing:

```bash
bash test/verify-env.sh
```

For local demos, copy `.env.sandbox.example` to `.env.sandbox`. This file remains untracked and is loaded by `scripts/start-sandbox.sh`.

## 5. Rotation

1. Create a new secret with updated values.
2. Reseal and commit the new file.
3. Apply it and remove the old sealed secret after verification.
