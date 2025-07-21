# Sealed Secrets Setup

The Secret Manager agent encrypts credentials so they can be safely stored in Git and deployed to Kubernetes. All secrets in this repository must be sealed before merging.

---

## Step 1 – Install kubeseal

Install the Bitnami `kubeseal` CLI with Homebrew:

```bash
brew install kubeseal
```

---

## Step 2 – Create a Kubernetes secret

Create your regular Kubernetes secret locally. For example:

```bash
kubectl create secret generic api-keys \
  --from-literal=EXCHANGE_KEY=abc123 \
  --from-literal=EXCHANGE_SECRET=def456 \
  --dry-run=client -o yaml > secret.yaml
```

---

## Step 3 – Encrypt the secret

Use `kubeseal` to generate an encrypted version that is safe to commit:

```bash
kubeseal < secret.yaml > sealed-secret.yaml
```

You can also combine creation and sealing in one step:

```bash
kubectl create secret generic api-keys \
  --from-env-file=.env \
  --dry-run=client -o json | \
  kubeseal --format yaml > sealed-secret.yaml
```

This is safe to run inside GitHub Actions when credentials come from repository
secrets.

---

## Step 4 – Commit the sealed secret

Add `sealed-secret.yaml` to your repository so it can be deployed with your manifests:

```bash
git add sealed-secret.yaml
```

---

## Step 5 – Apply the sealed secret

Apply the sealed secret to your cluster at deploy time:

```bash
kubectl apply -f sealed-secret.yaml
```

Our GitHub Actions workflow executes `test/verify-env.sh` to enforce this
policy. The script fails the build if any plaintext `.env` files or unsealed
`Secret` objects are present in the repository. Run the script locally before
opening a pull request to avoid a failed push.

For sandbox demonstrations, copy values from `.env.sandbox.example` into your
own `.env.sandbox` file. This file is ignored by Git and must never be

committed. Detailed instructions are available in
[docs/sandbox.md](sandbox.md).

---

## Rotation

Rotate credentials at least every 90 days:

1. Create a new Kubernetes secret with updated values.
2. Reseal using `kubeseal` and commit the new file.
3. Deploy the sealed secret and remove the old one after rollout.


Follow these steps whenever you need to store or update sensitive credentials.

