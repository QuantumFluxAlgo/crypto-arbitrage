# Local Sandbox Deployment

This guide walks through running the Prism platform entirely locally using Kind inside a Multipass VM.

## 1. Build Docker Images

```bash
# from repository root
podman build -t api-local ./api
podman build -t arb-dashboard ./dashboard
podman build -t arb-executor ./executor
podman build -t arb-feed-aggregator ./feed-aggregator
podman build -t arb-analytics ./analytics
```

## 2. Load Images into Kind

```bash
kind load docker-image api-local arb-dashboard arb-executor arb-feed-aggregator arb-analytics --name prism
```

## 3. Apply Dummy Secrets

Create a file `prod-secret.yaml` with the Redis password and any other dummy values you require. Apply it before installing the chart:

```bash
kubectl apply -f prod-secret.yaml
```

## 4. Deploy the Helm Chart

```bash
helm install arb ./infra/helm --values infra/helm/values.yaml
```

The services will start in dry-run sandbox mode. The dashboard is available at `http://localhost:3000` on the VM.
