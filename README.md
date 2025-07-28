# Prism Arbitrage

Prism is a dry-run crypto trading platform built to run on Kubernetes. All services are containerized and deployed together using Helm. The default execution mode is `sandbox`, which processes mock trades while exercising the full control flow.

This repository assumes development inside a Multipass Ubuntu VM. A local cluster is created with [kind](https://kind.sigs.k8s.io/) and images are loaded directly into the node. Secrets remain unsealed in the VM for simplicity.

## Quick Start

```bash
# inside the VM
git clone <repo-url> ~/Documents/crypto-arbitrage
cd ~/Documents/crypto-arbitrage

# copy dummy environment
cp .env.sandbox.example .env.sandbox
```

Build the container images:

```bash
docker build -t arb-api ./api
docker build -t arb-dashboard ./dashboard
docker build -t arb-executor ./executor
docker build -t arb-feed-aggregator ./feed-aggregator
docker build -t arb-analytics ./analytics
```

Create and prepare the cluster:

```bash
kind create cluster --name prism
kind load docker-image arb-api arb-dashboard arb-executor arb-feed-aggregator arb-analytics --name prism
kubectl apply -f prod-secret.yaml
```

Deploy everything with Helm:

```bash
helm install prism ./infra/helm --values infra/helm/values.yaml
```

The dashboard will be available at `http://localhost:3000` from the VM. Log in with the credentials defined in `.env.sandbox`.

## Documentation

- [Environment Configuration](docs/environment-config.md)
- [Local Deployment Guide](docs/local-deployment.md)
- [Secrets Reference](docs/secrets-reference.md)

Released under the [MIT](LICENSE) license.
