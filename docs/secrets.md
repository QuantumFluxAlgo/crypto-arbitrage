# Sealed Secrets Setup

The Secret Manager agent encrypts credentials so they can be safely stored in Git and deployed to Kubernetes.

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

---

Follow these steps whenever you need to store or update sensitive credentials.

