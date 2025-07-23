#!/bin/bash

set -e

# Start a local Kubernetes cluster if none is running
if ! kubectl cluster-info > /dev/null 2>&1; then
  if ! command -v kind >/dev/null 2>&1; then
    echo "Installing kind..."
    curl -Lo kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
    chmod +x kind
    sudo mv kind /usr/local/bin/
  fi
  echo "Starting kind cluster for tests..."
  kind create cluster --name prism-ci >/dev/null
  trap 'kind delete cluster --name prism-ci' EXIT
fi

# Ensure kubectl is available before running tests
if ! command -v kubectl &> /dev/null; then
  echo "kubectl is required. Please install it."
  exit 1
fi

echo "🔧 Running runtime behavior simulation tests..."

echo "🧪 Triggering panic brake (loss > 5%)"
curl -s -X POST http://localhost:8080/api/test/panic \
  -H "Content-Type: application/json" \
  -d '{"type":"loss", "value":9}' | jq

echo "✅ Panic triggered. Waiting 3s..."
sleep 3

echo "📋 Checking executor logs for PANIC marker..."
kubectl logs deploy/executor | grep -q "PANIC" && echo "✅ Panic confirmed" || {
  echo "❌ PANIC not detected in logs"
  exit 1
}

echo "🔁 Sending resume signal..."
curl -s -X POST http://localhost:8080/api/test/resume | jq
sleep 2

echo "📋 Checking executor logs for RESUME marker..."
kubectl logs deploy/executor | grep -q "RESUME SIGNAL RECEIVED" && echo "✅ Resume confirmed" || {
  echo "❌ Resume not detected in logs"
  exit 1
}

echo "💰 Simulating cold wallet sweep (dry-run)"
curl -s -X POST http://localhost:8080/api/test/sweep | jq
sleep 2

echo "📋 Verifying sweep logs..."
kubectl logs deploy/executor | grep -q "DRY-RUN MODE.*Cold wallet sweep logic verified" && echo "✅ Cold sweep verified" || {
  echo "❌ Cold sweep not logged properly"
  exit 1
}

echo "✅ All behavior tests passed!"
