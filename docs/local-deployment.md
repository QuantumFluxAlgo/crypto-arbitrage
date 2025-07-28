# Local Deployment Guide

These instructions run the entire stack in sandbox mode inside a Multipass Ubuntu VM. The Kubernetes cluster uses [kind](https://kind.sigs.k8s.io/) and the services are installed with [Helm](https://helm.sh/).

## 1. Install Prerequisites

Inside the VM install Docker, kind, kubectl and Helm. Use your package manager or download the official binaries.

## 2. Build Images

Run these commands from the repository root:

```bash
docker build -t arb-api ./api
docker build -t arb-dashboard ./dashboard
docker build -t arb-executor ./executor
docker build -t arb-feed-aggregator ./feed-aggregator
docker build -t arb-analytics ./analytics
```

## 3. Create the Cluster

```bash
kind create cluster --name prism
```

## 4. Load Images

```bash
kind load docker-image arb-api arb-dashboard arb-executor arb-feed-aggregator arb-analytics --name prism
```

## 5. Apply Secrets

Edit `prod-secret.yaml` and replace each value with a safe dummy string. Then apply it:

```bash
kubectl apply -f prod-secret.yaml
```

## 6. Deploy with Helm

```bash
helm install prism ./infra/helm --values infra/helm/values.yaml
```

After a short wait the dashboard will be reachable at `http://localhost:3000`. Services run with low resource requests so they fit easily on the kind node.

To remove everything:

```bash
helm uninstall prism
kind delete cluster --name prism
```
